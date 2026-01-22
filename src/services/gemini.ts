
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Strictly follow SDK initialization guidelines by using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ExtractedData {
  plate?: string;
  brand?: string;
  model?: string;
  imei?: string;
  reasoning: string;
}

export const geminiService = {
  extractVehicleInfo: async (imageBase64: string): Promise<ExtractedData> => {
    try {
      // Fix: Follow GenerateContentParameters structure and use the recommended model
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: "Atue como Perito Veicular Sênior. Extraia a Placa (Mercosul), Marca, Modelo e IMEI se visível. Retorne apenas JSON." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              plate: { type: Type.STRING },
              brand: { type: Type.STRING },
              model: { type: Type.STRING },
              imei: { type: Type.STRING },
              reasoning: { type: Type.STRING }
            },
            required: ["reasoning"]
          }
        }
      });

      // Fix: Use response.text property directly as per guidelines
      const text = response.text;
      return JSON.parse(text || '{}');
    } catch (error) {
      console.error("AI Extraction error:", error);
      return { reasoning: "Erro na extração de IA. Verifique manualmente." };
    }
  }
};
