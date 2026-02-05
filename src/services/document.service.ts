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

const documentKeys = {
  "ReceiptNote": {
    description: "Please extract the following specific fields from the provided json document and return the result as a JSON object using the exact key names listed: R/Note-No., Vendor Code, Supplier Name, Supplier Address, PO/AT No., PL No., R.O.No., R.O.Date, RN Quantity, Rate, Value, P.O.Sr.No.,Terms of Delivery, Freight, Inspection agency, IC no., dated, Challan/invoice no., Date(Challan Date), Qty. Invoiced, Qty. Received, Qty. Accepted, and Qty. Rejected. Ensure each of these keys is assigned a corresponding value from the document. If any value is missing or cannot be identified, assign it a value of null. The output should contain only the extracted values in a properly structured JSON format without any explanation, summary, or extra content. Return all the values in string format.(dated comes after Gate/Challan Registration No and the value is below the text dated in next line)(if 'Inspection agency' is 'CONSG' then put its value as 'Consignee')(Convert dated,Date(Challan Date),R.O.Date into dd/mm/yy format)(Convert the values of 'Rate' and 'Value' into exact digits by removing any commas and currency symbols (like 'Rs' or 'INR') at the beginning and remove any decimal portion. Ensure the result is stored as a string.)(In the fields 'Qty. Invoiced' and 'Qty. Received', extract only the numeric values, remove any decimal portion, and ensure the final result is stored as a string.)(remove any decimal portion)"
  },
  "TaxInvoice": {
    description: "Please extract the following specific fields from the provided json document of a tax invoice and return the result as a JSON object using the exact key names listed: Supplier Name, Supplier Address, GST No., Supplier PAN, CIN, Invoice No., Date, No of Pkg, Qty, Rate, Freight Charges, GST Amount, Total Sales Amount(after gst addition), Destination, Dispatched through, e-Way Bill no., Bill of Landing/LR-RR No., and HSN Code. Ensure each of these keys is assigned a corresponding value from the document. If any value is missing or cannot be identified, assign it a value of null. The output should contain only the extracted values in a properly structured JSON format without any explanation, summary, or extra content. Return all the values in string format.(Convert Date into dd/mm/yy format) (Convert the values of 'Rate' and 'Total Sales Amount(after gst addition)' into exact digits by removing any commas and currency symbols (like 'Rs' or 'INR') at the beginning and remove any decimal portion. Ensure the result is stored as a string.)(remove any decimal portion)"
  },
  "GSTInvoice": {
    description: "Please extract the following specific fields from the provided json document and return the result as a JSON object using the exact key names listed: Tax invoice no., IREPS Bill Reg No., Tax invoice date, Invoice Amount, Rnote no., Rnote date, Rnote date 2, DRR No., Rnote Value, Rnote no. 2, DRR Date, DRR No. 2, DRR No. 3, RO No., RO Date, Rnote Qty, PO Rate, PO Sr No, PL No, PO No, HSN Code, Supplier Name, Supplier Address, Supplier GSTIN, Inspection Agency, and Vendor Code. Ensure each of these keys is assigned a corresponding value from the document. If any value is missing or cannot be identified, assign it a value of null. The output should contain only the extracted values in a properly structured JSON format without any explanation, summary, or extra content. Return all the values in string format.( the value of 'Rnote date' is below it in the next line)('DRR No. 3','Rnote no. 2','Rnote date 2','RO No.','RO Date','Rnote Qty','Rnote Value' are present below the heading RNOTE DETAILS in a tabular format so fetch accordingly, the RNOTE DETAILS table will have the columns ['#','RNOTE TYPE','DRR NO.','RNOTE NO.','RNOTE DATE','RO NO.','RO DATE','RNOTE QTY','RNOTE VALUE','PAID VALUE'] and they will be in this order only so fetch data accordingly and if 'RO NO.' and 'RO DATE' get merged then seperate them before returning)(important point: if 'Rnote date' is null or not a date then make 'Rnote date 2' as 'Rnote date' also else no changes)(if 'Inspection Agency' is 'CONSG' then put its value as 'Consignee' and if 'TPI' then put it as 'Third Party Agency')  (Convert Tax invoice date,Rnote date,Rnote date 2,DRR Date,RO Date into dd/mm/yy format) (Convert the values of 'Invoice Amount' and 'Total Sales Amount(after gst addition)' into exact digits by removing any commas and currency symbols (like 'Rs' or 'INR') at the beginning and Remove any decimal portion by rounding off the number. Ensure the result is stored as a string.)(remove any decimal portion)"
  },
  "ModificationAdvice": {
    description: "Please extract the following specific fields from the provided json and return the result as a JSON object using the exact key names listed: P.O.No., Supplier Name, Supplier Address, P.O.Sr., PL no, and Vcode. Ensure each of these keys is assigned a corresponding value from the document. If any value is missing or cannot be identified, assign it a value of null. The output should contain only the extracted values in a properly structured JSON format without any explanation, summary, or extra content. Return all the values in string format. Return any date in dd/mm/yy format in string and convert it if it is not in that format.(remove any decimal portion)"
  },
  "InspectionCertificate": {
    description: "Please extract the following specific fields from the provided json document and return the result as a JSON object using the exact key names listed: Certificate no., PO Number, Date, IC Count No., PO Serial Number, Inspection quantity details, Order Qty, Qty Offered, Qty not due, Qty Passed, and Qty Rejected. Ensure each of these keys is assigned a corresponding value from the document. If any value is missing or cannot be identified, assign it a value of null. The output should contain only the extracted values in a properly structured JSON format without any explanation, summary, or extra content. Return all the values in string format. (Convert Date into dd/mm/yy format) (remove any decimal portion) "
  },
  "PurchaseOrder": {
    description: "Please extract the following specific fields from the provided json document and return the result as a JSON object using the exact key names listed: PO No., Inspection Agency, Basic Rate, PO Sr., PL No, Ordered Quantity, Freight Charges, and Security Money (point 4 in other terms & conditions). Ensure each of these keys is assigned a corresponding value from the document. If any value is missing or cannot be identified, assign it a value of null. The output should contain only the extracted values in a properly structured JSON format without any explanation, summary, or extra content. Return all the values in string format. (For PO Sr. it is a column in a table so fetch data accordingly and take the value in the first row)(Convert the values of 'Basic Rate' into exact digits by removing any commas and currency symbols (like 'Rs' or 'INR') at the beginning and remove any decimal portion. Ensure the result is stored as a string.)(remove any decimal portion ) "
  }
};

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    
    reader.onerror = error => reject(error);
  });
};

export const getdata = async (file: File, documentType: keyof typeof documentKeys, rowId: number) => {
  console.log("called");

  // Convert File to base64 (without header)
  const fileBase64 = await convertFileToBase64(file); 
  const cleanBase64 = (fileBase64 as string).split(',')[1]; 
  
  const data = {
    prompt: "Extract all data",
    fileBase64: cleanBase64,
    documentType: documentType,
    rowId: "1",
  }
  
  console.log("Sending to API:", data);
  
    try {
      const answer = await fetchWrapper.post(`${config.apiUrl}/api/extract-finance-data`, data);
      console.log("gpt answer", answer);
    } catch (err) {
      console.error("Fetch error:", err);
      throw err;
    }
};