
import { GoogleGenAI, Type } from "@google/genai";
import { Question, RevisionData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const QUESTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    topic: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    question: { type: Type.STRING },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: 4,
      maxItems: 4
    },
    correctIndex: { type: Type.INTEGER, minimum: 0, maximum: 3 },
    explanation: { type: Type.STRING }
  },
  required: ["id", "topic", "difficulty", "question", "options", "correctIndex", "explanation"]
};

export const generateQuestionBatch = async (
  batchRequirements: { topic: string, count: number }[],
  difficultyContext: string
): Promise<Question[]> => {
  const reqStr = batchRequirements.map(r => `${r.count} questions for "${r.topic}"`).join(', ');
  const prompt = `Generate exactly ${batchRequirements.reduce((a, b) => a + b.count, 0)} quantitative aptitude questions as follows: ${reqStr}.
  Difficulty Context: ${difficultyContext}.
  Format: MCQ with 4 options. Include a detailed step-by-step mathematical explanation for each.
  Ensure unique content and high mathematical accuracy.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: QUESTION_SCHEMA
        }
      }
    });

    const text = response.text || '[]';
    return JSON.parse(text);
  } catch (error) {
    console.error("Batch generation error:", error);
    return [];
  }
};

export const generateSingleQuestion = async (
  topic: string,
  difficultyContext: string,
  seenThemes: string[]
): Promise<Question | null> => {
  // Keeping this for potential single-question regenerations, 
  // but batching is preferred for startup speed.
  const batch = await generateQuestionBatch([{ topic, count: 1 }], difficultyContext);
  return batch.length > 0 ? batch[0] : null;
};

export const generateRevisionContent = async (topics: string[]): Promise<RevisionData[]> => {
  const prompt = `Act as an expert aptitude tutor. For the following topics: ${topics.join(', ')}, provide a high-yield revision summary.
  For each topic, provide Important Notes (theory), Essential Formulas, and Tips/Shortcuts.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              topic: { type: Type.STRING },
              basics: { type: Type.STRING },
              formulas: { type: Type.ARRAY, items: { type: Type.STRING } },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["topic", "basics", "formulas", "tips"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error generating revision content:", error);
    return [];
  }
};
