
import { GoogleGenAI, Type } from "@google/genai";
import { MultilingualString } from "../types";

export const translateWithGemini = async (text: string): Promise<MultilingualString | null> => {
  if (!text) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following menu item text into Arabic, Russian, and Chinese. Return ONLY a JSON object.
      Input: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            en: { type: Type.STRING },
            ar: { type: Type.STRING },
            ru: { type: Type.STRING },
            zh: { type: Type.STRING },
          },
          required: ["en", "ar", "ru", "zh"]
        }
      }
    });

    const result = JSON.parse(response.text);
    // Ensure English matches original if AI changed it
    result.en = text;
    return result as MultilingualString;
  } catch (error) {
    console.error("Translation Error:", error);
    return null;
  }
};
