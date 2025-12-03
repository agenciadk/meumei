import { GoogleGenAI } from "@google/genai";

// Initialize the client. The API_KEY will be needed when we implement the dashboard features.
// For now, this is a placeholder to show architectural readiness.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const getFinancialAdvice = async (summary: string): Promise<string> => {
  if (!apiKey) {
    console.warn("API Key not set for Gemini");
    return "API Key missing.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this financial summary and give brief advice: ${summary}`,
    });
    return response.text || "No advice generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate advice at this time.";
  }
};
