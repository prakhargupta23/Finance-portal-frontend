import { ContainerClient } from '@azure/storage-blob';
import { fetchWrapper } from "../helpers/fetch-wrapper";
import { config } from "../shared/constants/config";

const sasUrl = 'https://financenwr.blob.core.windows.net/financedocs?sp=racwdl&st=2026-02-04T20:16:34Z&se=2027-01-01T04:31:34Z&spr=https&sv=2024-11-04&sr=c&sig=1nWc1jjFSnhEHUEsBWQZ4%2FcVwG4cnncUPgx7N8dxpm4%3D';

export async function uploadDocumenttoblob(doc: string, file: File): Promise<string> {
  try {
    const containerClient = new ContainerClient(sasUrl);
    const extension = file.name.split('.').pop() || 'bin';
    const blobName = `${doc.replace(/\s+/g, '_')}_${Date.now()}.${extension}`;
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.upload(file, file.size);
    return blobClient.url;
  } catch (error) {
    console.error('Upload failed in service', error);
    throw error;
  }
}

export async function getDocumentUrl(doc: string): Promise<string | null> {
  // This could be implemented if needed, but for now, since URLs are stored in state, perhaps not necessary
  // If you want to fetch from storage, you can list blobs or something, but for simplicity, return null or implement later
  return null;
}

// << CLEANUP: Removed unused documentKeys prompts from unrelated projects >>

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);

    reader.onerror = error => reject(error);
  });
};

export const getdata = async (
  file: File,
  documentType: string,
  sNo: string,
  fileName: string,
  fileUrl?: string,
  apiPath: string = "/api/extract-finance-data",
  docLabel?: string
) => {
  console.log("called");

  // Convert File to base64 (without header)
  const fileBase64 = await convertFileToBase64(file);
  const cleanBase64 = (fileBase64 as string).split(',')[1];

  const data = {
    prompt: "Extract all data",
    fileBase64: cleanBase64,
    documentType: documentType,

    sNo: sNo,
    fileName: fileName,
    fileUrl: fileUrl,
    docLabel: docLabel
  }

  console.log("Sending to API:", {
    apiPath,
    documentType: data.documentType,
    sNo: data.sNo,
    fileBase64Length: data.fileBase64?.length || 0,
  });

  try {
    const answer = await fetchWrapper.post(`${config.apiUrl}${apiPath}`, data);
    console.log("gpt answer", answer);
    return answer;
  } catch (err) {
    console.error("Fetch error:", err);
    throw err;
  }
};
