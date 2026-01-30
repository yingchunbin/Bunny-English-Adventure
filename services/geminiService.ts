
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

export interface StoryFeedback {
    score: number; // 1-10
    isCorrect: boolean; // Threshold >= 7
    corrected: string; // The correct/better version
    explanation: string; // Why?
    suggestion: string; // Tips for next time
    alternatives: string[]; // NEW: List of natural ways to say it
}

export interface VocabHint {
    en: string;
    vi: string;
}

export interface GeneratedStorySegment {
    vi: string;
    en: string; 
    vocabList: VocabHint[]; // Changed to structured list
    grammarTip: string;
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

// UPDATED: No longer takes 'context', strictly sentence-to-sentence
export const evaluateStoryTranslation = async (
    vietnameseSentence: string,
    userEnglish: string
): Promise<StoryFeedback> => {
    if (!process.env.API_KEY) {
        return {
            score: 10,
            isCorrect: true,
            corrected: "Good job (Offline mode)",
            explanation: "Thầy Rùa đang mất mạng nên cho con 10 điểm luôn!",
            suggestion: "Lần sau kiểm tra lại mạng nhé!",
            alternatives: ["Way to go!", "Nice work!"]
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Strict Prompt: NO CONTEXT provided to the model
        const prompt = `
        TARGET SENTENCE (Vietnamese): "${vietnameseSentence}"
        STUDENT ANSWER (English): "${userEnglish}"

        INSTRUCTIONS FOR THẦY RÙA:
        1. Ignore any previous story context. Grade ONLY based on the exact meaning of the "TARGET SENTENCE" provided above.
        2. Strict Grammar Check:
           - Check spelling, plurals ('s'), articles ('a/an/the'), and verb tenses carefully.
           - If the target sentence is "Môn học", do NOT require "Our favorite subjects" (that's hallucination). Accept "Subject" or "Subjects".
           - Only require possessives (my/our) if the Vietnamese explicitly says "của tôi/của chúng mình".
        3. Output JSON:
           - score (1-10)
           - isCorrect (boolean): False if there is ANY grammatical error or wrong meaning.
           - explanation (Vietnamese): Explain the error clearly. Point out exactly which word is wrong/missing based strictly on the target sentence.
           - corrected: The best literal translation.
           - alternatives: Other valid translations.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                systemInstruction: `You are Thầy Rùa, a strict but fair English teacher. 
                You grade translations literally based ONLY on the provided Vietnamese sentence. 
                You do not invent details from a background story.`,
                responseMimeType: "application/json",
                safetySettings: SAFETY_SETTINGS,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        isCorrect: { type: Type.BOOLEAN },
                        corrected: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        suggestion: { type: Type.STRING },
                        alternatives: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["score", "isCorrect", "corrected", "explanation", "suggestion", "alternatives"]
                }
            }
        });

        const text = response.text || '{}';
        return cleanAndParseJSON(text) || { 
            score: 0, 
            isCorrect: false, 
            corrected: "", 
            explanation: "Lỗi phân tích", 
            suggestion: "Thử lại nhé",
            alternatives: []
        };

    } catch (error) {
        console.error("Gemini Story Error:", error);
        return {
            score: 0,
            isCorrect: false,
            corrected: "",
            explanation: "Thầy Rùa đang bận chút, con thử lại sau nhé.",
            suggestion: "",
            alternatives: []
        };
    }
};

export const generateCohesiveStory = async (
    topic: string,
    words: string[],
    grade: number
): Promise<{ segments: GeneratedStorySegment[] }> => {
    if (!process.env.API_KEY) {
        return { segments: [] }; 
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Write a very short, simple, cohesive story (5 sentences max) for a Grade ${grade} Vietnamese student learning English.
        Topic: ${topic}.
        Mandatory Vocabulary to use: ${words.join(', ')}.
        
        Requirements:
        1. The story must make sense and have a flow.
        2. Return JSON with 'vi' (Vietnamese), 'en' (English).
        3. 'vocabList': Provide a list of key vocabulary words used in this specific sentence.
        4. 'grammarTip' MUST BE IN VIETNAMESE.
        5. IMPORTANT: The Vietnamese translation ('vi') must be accurate to the English ('en') so the student knows exactly what to translate. Do not omit details in the Vietnamese version that appear in English.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                safetySettings: SAFETY_SETTINGS,
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        segments: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    vi: { type: Type.STRING },
                                    en: { type: Type.STRING },
                                    vocabList: { 
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                en: { type: Type.STRING },
                                                vi: { type: Type.STRING }
                                            }
                                        }
                                    },
                                    grammarTip: { type: Type.STRING, description: "Must be in Vietnamese" }
                                },
                                required: ["vi", "en", "vocabList", "grammarTip"]
                            }
                        }
                    },
                    required: ["segments"]
                }
            }
        });

        const text = response.text || '{}';
        return cleanAndParseJSON(text) || { segments: [] };

    } catch (error) {
        console.error("Gemini Story Generation Error:", error);
        return { segments: [] };
    }
};
