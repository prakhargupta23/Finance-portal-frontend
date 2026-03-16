const SARVAM_API_KEY = "YOUR_SARVAM_API_KEY";

export async function speechToText(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob);

  const response = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SARVAM_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.text;
}

export async function textToSpeech(text: string): Promise<string> {
  const response = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SARVAM_API_KEY}`,
    },
    body: JSON.stringify({
      text,
      voice: "en_female",
      format: "wav",
    }),
  });

  const buffer = await response.arrayBuffer();
  const blob = new Blob([buffer], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}
