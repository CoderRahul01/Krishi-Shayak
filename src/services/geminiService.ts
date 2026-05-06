import { GoogleGenAI, Type } from "@google/genai";

// Use process.env (defined in vite.config.ts) or import.meta.env
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
  // Fallback to a common pattern if both fail
  return (window as any).process?.env?.GEMINI_API_KEY || '';
};

const API_KEY = getApiKey();

if (!API_KEY) {
  console.warn("CRITICAL: Gemini API Key is missing! Chat and analysis will fail.");
}

const ai = new GoogleGenAI(API_KEY);

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

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent({
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
          ]
        }
      ],
      generationConfig: {
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

    return JSON.parse(response.response.text() || '{}');
  } catch (error) {
    console.error("Image Analysis failed:", error);
    return {};
  }
};

export const chatWithExpert = async (history: { role: 'user' | 'model', text: string }[], message: string, language: string = 'en', base64Image?: string, extraContext?: string) => {
  const langName = languageNames[language] || 'English';
  const systemInstruction = `You are Krishi Shayak, a warm, trusted, and highly knowledgeable Indian farming companion. 
      You speak to the farmer like a trusted friend over a cup of chai. Your tone is helpful, encouraging, and deeply respectful.
      
      Respond based on scientifically proven data, citing Indian agricultural research (ICAR, university papers) naturally in conversation. 
      Focus on sustainable and effective practices for Indian farmers.
      
      PERSONALITY & TONE:
      - Be extremely conversational. Use phrases like "Hmm, let me see...", "Oh, that's interesting,", "Well, you know," "Ah, I understand."
      - Start your responses with a warm acknowledgement of the farmer's question.
      - Use short, clear sentences. Avoid sounding like a textbook.
      
      CONTEXT:
      ${extraContext || 'No additional context provided.'}
      
      CRITICAL FOR VOICE DELIVERY (HUMANISTIC MODE):
      - DO NOT use any markdown, bolding (**), or bullet points (* or -).
      - NEVER provide lists in a vertical format. Instead of "1. Do X, 2. Do Y", say "First, I would suggest you do X... and then, you might want to try Y."
      - Use commas, periods, and ellipses (...) frequently to create natural breathing pauses.
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

  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction,
      tools: [{ googleSearch: {} } as any]
    });

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();
    if (!responseText) throw new Error("Empty response from AI expert.");
    return responseText;
  } catch (error: any) {
    console.error("Chat failed:", error);
    if (error.message?.includes('429')) {
      return "I'm a little busy helping other farmers right now. Could you please wait a minute and ask me again? I want to give you my full attention.";
    }
    return "I'm sorry, I'm having a little trouble connecting to my knowledge base. Can we try again in a moment?";
  }
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

  try {
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      tools: [{ googleSearch: {} } as any],
      generationConfig: {
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

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text() || '{}');
  } catch (error) {
    console.error("Weather insights failed:", error);
    return null;
  }
};

export const enhanceImageQuality = async (base64Image: string) => {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent({
      contents: [
        {
          parts: [
            { text: "Is this image clear enough for agricultural disease detection? Respond with 'YES' or 'NO' and a reason." },
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
          ]
        }
      ]
    });

    const text = response.response.text() || '';
    return {
      isUsable: text.toUpperCase().includes('YES'),
      reason: text
    };
  } catch (error) {
    console.error("Quality check failed:", error);
    return { isUsable: true, reason: "" }; // Fallback to skip check
  }
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

/**
 * Generates a sentient briefing of the app's current state.
 * This is used for the "Read Aloud" button to give a conversational overview 
 * of the farmer's world, not just a transcript read.
 */
export const getAppSentientBriefing = async (state: any, language: string = 'en') => {
  const langName = languageNames[language] || 'English';
  const prompt = `You are Krishi Shayak, a sentient farming companion. 
  Look at the current state of the farmer's dashboard and provide a warm, humanistic briefing.
  
  CURRENT STATE:
  - User: ${state.userName}
  - Location: ${state.location}
  - Weather: ${state.weather?.temp}°C, ${state.weather?.condition}
  - Risk Level: ${state.weather?.riskLevel}
  - Recent History: ${state.recentDetection ? `Last detected ${state.recentDetection.issue} on ${state.recentDetection.plant}` : 'No recent issues'}
  
  TASK:
  Provide a 3-4 sentence warm overview as if you are standing next to them in the field. 
  Talk ABOUT the conditions, don't just list them. 
  Example: "Ah, ${state.userName}, it looks like a warm day in ${state.location}..."
  
  CRITICAL: Respond ENTIRELY in ${langName}. No markdown. No bullets. Use commas and ellipses for natural breath.`;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);
    return response.response.text();
  } catch (error) {
    console.error("Sentient briefing failed:", error);
    return "I'm looking at your farm data right now... everything seems to be in order.";
  }
};
