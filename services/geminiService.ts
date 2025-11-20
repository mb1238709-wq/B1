
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-3-pro-preview';

export async function analyzePlantImage(imageData: string, mimeType: string): Promise<string> {
  try {
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: "Identify the plant in this image. Provide its common and scientific names. Then, give detailed care instructions including watering schedule, sunlight requirements, soil type, and common pests or diseases to watch out for. Format the response using markdown with ## for main headers and ### for sub-headers.",
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [imagePart, textPart] },
    });
    
    if (response.text) {
        return response.text;
    } else {
        throw new Error("Failed to get a valid response from the API.");
    }
  } catch (error) {
    console.error("Error analyzing plant image:", error);
    throw new Error("Could not analyze the image. Please try again.");
  }
}
