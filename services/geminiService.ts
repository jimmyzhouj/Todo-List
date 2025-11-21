import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is not set in the environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateTaskTips = async (taskTitle: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Please configure your API Key to use AI features.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide 3 very short, actionable bullet points (max 10 words each) on how to efficiently complete this task: "${taskTitle}". Output only the bullet points.`,
    });

    return response.text || "No tips available.";
  } catch (error) {
    console.error("Error generating tips:", error);
    return "Failed to load tips. Please try again later.";
  }
};