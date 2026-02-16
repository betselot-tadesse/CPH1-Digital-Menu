
import { GoogleGenAI, Type } from "@google/genai";
import { MultilingualString } from "../types";

export const translateWithGemini = async (text: string): Promise<MultilingualString | null> => {
  if (!text || !text.trim() || text.length < 2) return null;

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing in process.env. Translation cannot proceed.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional translator for a luxury hotel menu. 
      Translate the following English text into Arabic (ar), Russian (ru), and Chinese (zh).
      Maintain the culinary context and tone.
      
      Input text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            en: { type: Type.STRING, description: "The original English text" },
            ar: { type: Type.STRING, description: "Arabic translation" },
            ru: { type: Type.STRING, description: "Russian translation" },
            zh: { type: Type.STRING, description: "Simplified Chinese translation" },
          },
          required: ["en", "ar", "ru", "zh"]
        }
      }
    });

    const textResponse = response.text;
    if (!textResponse) throw new Error("Empty response from Gemini");

    const result = JSON.parse(textResponse);
    // Force English to be exactly what was passed in
    result.en = text;
    
    return result as MultilingualString;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return null;
  }
};
