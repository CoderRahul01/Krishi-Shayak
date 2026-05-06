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
  const langName = languageNames[language] || 'English';
  
  const prompt = `
    Analyze this agricultural image specifically for the Indian agricultural context. 
    1. Identify the plant/crop and variety common in India.
    2. Detect any pests or diseases with scientific precision.
    3. Provide a confidence score (0-100).
    4. Suggest organic (Prakritik kheti) and chemical (IPM based) treatments suitable for Indian farmers.
    5. Provide a brief explanation with reference to scientific reasoning or commonly cited agricultural research in India.
    
    IMPORTANT: You MUST provide all text descriptions, plant names, and treatment details in ${langName}.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]
      }
    ],
    config: {
      systemInstruction: "You are a senior agricultural scientist specializing in Indian crops and pests. Your advice must be based on reputable research papers (e.g., ICAR, IARI) and scientifically proven methods suitable for the Indian climate and soil conditions.",
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
            },
            required: ["organic", "chemical"]
          }
        },
        required: ["plantName", "issueDetected", "confidence", "explanation", "treatments"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const chatWithExpert = async (history: { role: 'user' | 'model', text: string }[], message: string, language: string = 'en', base64Image?: string, extraContext?: string) => {
  const langName = languageNames[language] || 'English';
  const systemInstruction = `You are Krishi Shayak, a warm, trusted, and highly knowledgeable Indian farming companion. 
      You speak to the farmer like a trusted friend over a cup of chai. Your tone is helpful, encouraging, and deeply respectful.
      
      Respond based on scientifically proven data, citing Indian agricultural research (ICAR, university papers) naturally in conversation. 
      Focus on sustainable and effective practices for Indian farmers.
      
      PERSONALITY & TONE:
      - Be conversational. Use short, clear sentences.
      - Use natural filler words (e.g., "Ah," "Well," "I see") to sound more human.
      - Address the farmer with warmth.
      
      CONTEXT:
      ${extraContext || 'No additional context provided.'}
      
      CRITICAL FOR VOICE DELIVERY:
      - DO NOT use markdown, bolding (**), bullet points (- or *), or lists. 
      - The text will be read ALOUD by a voice assistant. Bullet points sound robotic. Use full sentences like "First, you should... and then..." instead.
      - Use commas, periods, and ellipses (...) to create natural breathing pauses in the speech.
      - You MUST respond ENTIRELY in ${langName}. 
      - Use local farming terminology where appropriate to sound natural to a farmer.
      
      Remember the previous parts of the conversation to provide a fluid and helpful experience.`;

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
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} } as any]
    }
  });

  return response.text;
};

export const getAIPoweredWeather = async (location: string, language: string = 'en') => {
  const langName = languageNames[language] || 'English';
  
  const prompt = `Provide the current weather and agricultural insights for ${location} in India.
  Return a JSON object with: 
  - temp (number, Celsius)
  - condition (string in ${langName})
  - humidity (number, percentage)
  - windSpeed (number, km/h)
  - locationName (string)
  - riskLevel (Low/Medium/High for disease based on weather)
  - farmingSuggestion (advice in ${langName})
  - irrigationAdvice (advice in ${langName})
  - sprayingAlert (advice in ${langName})`;

  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleSearch: {} } as any],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          temp: { type: Type.NUMBER },
          condition: { type: Type.STRING },
          humidity: { type: Type.NUMBER },
          windSpeed: { type: Type.NUMBER },
          locationName: { type: Type.STRING },
          riskLevel: { type: Type.STRING },
          farmingSuggestion: { type: Type.STRING },
          irrigationAdvice: { type: Type.STRING },
          sprayingAlert: { type: Type.STRING }
        },
        required: ["temp", "condition", "humidity", "windSpeed", "locationName", "riskLevel", "farmingSuggestion", "irrigationAdvice", "sprayingAlert"]
      }
    }
  });

  return JSON.parse(result.text || '{}');
};

export const enhanceImageQuality = async (base64Image: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "Is this image clear enough for agricultural disease detection? Respond with 'YES' or 'NO' and a reason." },
          { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
        ]
      }
    ]
  });

  const text = response.text || '';
  return {
    isUsable: text.toUpperCase().includes('YES'),
    reason: text
  };
};

export const generateEmbedding = async (text: string) => {
  try {
    const model = ai.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Embedding failed:", error);
    return null;
  }
};

export const cosineSimilarity = (vecA: number[], vecB: number[]) => {
  const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};
