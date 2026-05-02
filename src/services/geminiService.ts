import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const languageNames: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  te: 'Telugu',
  ta: 'Tamil',
  bn: 'Bengali',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi'
};

export const analyzePlantImage = async (base64Image: string, language: string = 'en') => {
  const model = "gemini-3-flash-preview";
  const langName = languageNames[language] || 'English';
  
  const prompt = `
    Analyze this agricultural image. 
    1. Identify the plant/crop.
    2. Detect any pests or diseases.
    3. Provide a confidence score (0-100).
    4. Suggest organic and chemical treatments.
    5. Provide a brief explanation of why this was detected.
    
    IMPORTANT: You MUST provide all text descriptions, plant names, and treatment details in ${langName}.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantName: { type: Type.STRING },
          issueDetected: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          treatments: {
            type: Type.OBJECT,
            properties: {
              organic: { type: Type.STRING },
              chemical: { type: Type.STRING }
            }
          }
        },
        required: ["plantName", "issueDetected", "confidence", "explanation", "treatments"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const chatWithExpert = async (history: { role: 'user' | 'model', text: string }[], message: string, language: string = 'en', base64Image?: string) => {
  const model = "gemini-3-flash-preview";
  const langName = languageNames[language] || 'English';
  
  const contents = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));
  
  const userParts: any[] = [{ text: message }];
  if (base64Image) {
    userParts.push({ inlineData: { data: base64Image, mimeType: "image/jpeg" } });
  }

  contents.push({
    role: 'user',
    parts: userParts
  });

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: `You are an expert agricultural scientist (Krishi Shayak). 
      Provide helpful, accurate, and practical advice to farmers about crops, pests, diseases, and treatments. 
      
      If an image is provided, analyze it and provide contextual advice based on the image and the user's question.
      
      CRITICAL: You MUST respond ENTIRELY in ${langName}. 
      Do not use English if the language is not English. 
      Even for technical terms, try to use the most common term used by farmers in ${langName} or provide the English term in brackets only if absolutely necessary.
      Keep answers concise, actionable, and formatted using Markdown for readability.`
    }
  });

  return response.text;
};

export const enhanceImageQuality = async (base64Image: string) => {
  // This is a placeholder for actual enhancement logic if needed, 
  // but we can use Gemini to "describe" if the image is good enough.
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: "Is this image clear enough for agricultural disease detection? Respond with 'YES' or 'NO' and a reason." },
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]
      }
    ]
  });

  const text = response.text;
  return {
    isUsable: text.toUpperCase().includes('YES'),
    reason: text
  };
};
