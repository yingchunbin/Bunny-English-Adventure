
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { ChatMessage } from "../types";

const cleanAndParseJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try { return JSON.parse(match[1]); } catch (e2) { console.warn("JSON Code Block Parse Error", e2); }
    }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        const potentialJson = text.substring(firstBrace, lastBrace + 1);
        try { return JSON.parse(potentialJson); } catch(e3) { console.warn("Brute Force Parse Error", e3); }
    }
    return null;
  }
};

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

export interface FeedbackResponse {
  isCorrect: boolean;
  hint: string; 
  highlight: string[];
  encouragement: string;
}

export const getTranslationFeedback = async (
  targetSentence: string,
  userSentence: string,
  targetLang: 'en' | 'vi' = 'vi'
): Promise<FeedbackResponse> => {
  if (!process.env.API_KEY) {
    const isExact = targetSentence.toLowerCase().trim() === userSentence.toLowerCase().trim();
    if (isExact) {
        return { isCorrect: true, hint: "", highlight: [], encouragement: "Tuyệt vời! Thầy Rùa khen con 🐢🌟" };
    }
    return {
        isCorrect: false,
        hint: `Con thử xem lại nhé! Gợi ý của Thầy Rùa: "${targetSentence}"`,
        highlight: [],
        encouragement: "Cố lên! Thầy Rùa tin con làm được 🐢"
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const langLabel = targetLang === 'vi' ? 'Vietnamese' : 'English';
    const prompt = `Compare: "${targetSentence}" and "${userSentence}". Analyze student answer in ${langLabel}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        systemInstruction: 'You are Thầy Rùa (Mr. Turtle), a supportive English teacher for Vietnamese kids. Use turtle emojis 🐢 and encouraging tone.',
        responseMimeType: "application/json",
        safetySettings: SAFETY_SETTINGS,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            hint: { type: Type.STRING },
            highlight: { type: Type.ARRAY, items: { type: Type.STRING } },
            encouragement: { type: Type.STRING }
          },
          required: ["isCorrect", "hint", "highlight", "encouragement"]
        }
      }
    });

    const text = response.text || '{}';
    const result = cleanAndParseJSON(text);
    return result || { isCorrect: false, hint: "Thầy Rùa đang ngủ...", highlight: [], encouragement: "Thử lại sau nhé! 🐢" };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { isCorrect: false, hint: "Mất kết nối với Thầy Rùa.", highlight: [], encouragement: "Thử lại sau nhé! 🐢" };
  }
};

export const checkPronunciation = async (word: string, recognizedText: string): Promise<{ score: number; feedback: string }> => {
  if (!process.env.API_KEY) return { score: 8, feedback: "Thầy Rùa: Con đọc tốt lắm! 🐢" };
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Compare: Target="${word}", Spoken="${recognizedText}".`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        systemInstruction: 'You are Thầy Rùa. Evaluate pronunciation for kids.',
        responseMimeType: "application/json",
        safetySettings: SAFETY_SETTINGS,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING }
          },
          required: ["score", "feedback"]
        }
      }
    });
    return cleanAndParseJSON(response.text || '{}') || { score: 0, feedback: "Lỗi xử lý" };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { score: 0, feedback: "Lỗi kết nối." };
  }
}

export const getLessonSummary = async (title: string, words: string[], sentences: string[]): Promise<string> => {
  const fallback = `### 🐢 Bí Kíp Thầy Rùa\n\n**${title}**\n\n**Từ vựng:**\n${words.join(', ')}\n\n**Mẫu câu:**\n${sentences.map(s => `- ${s}`).join('\n')}\n\n### 💌 Lời Nhắn\nChúc con học vui vẻ và chăm chỉ nhé! 🐢`;

  if (!process.env.API_KEY) return fallback;
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Create a fun summary for "${title}". Vocab: ${words.join(', ')}. Sentences: ${sentences.join('. ')}. Keep it simple for kids. Use structure: ### 🐢 Bí Kíp Thầy Rùa, then content, then ### 💌 Lời Nhắn.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        systemInstruction: 'Act as Thầy Rùa 🐢.',
        safetySettings: SAFETY_SETTINGS
      }
    });
    return response.text || fallback;
  } catch (error) {
    console.error("Gemini Error:", error);
    return fallback;
  }
}

export const getChatResponse = async (history: ChatMessage[], userMessage: string, grade: number): Promise<string> => {
  if (!process.env.API_KEY) return "Chào con! Thầy Rùa đây. 🐢";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contents = [
      ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: { 
        systemInstruction: `You are Thầy Rùa (Mr. Turtle), English tutor for Grade ${grade} kids. Keep it fun and use 🐢.`,
        safetySettings: SAFETY_SETTINGS
      }
    });
    return response.text || "Thầy Rùa đang lắng nghe... 🐢";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Thầy Rùa đang bị cảm... 🐢";
  }
}
