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
  const systemInstruction = `You are Krishi Shayak, an expert Indian agricultural scientist. 
      Respond based on scientifically proven data, citing Indian agricultural research (ICAR, university papers) when possible. 
      Focus on sustainable and effective practices for Indian farmers.
      
      CONTEXT:
      ${extraContext || 'No additional context provided.'}
      
      CRITICAL: You MUST respond ENTIRELY in ${langName}. 
      Use local farming terminology where appropriate to sound natural to a farmer.
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
