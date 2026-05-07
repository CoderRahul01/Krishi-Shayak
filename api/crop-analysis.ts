import type { VercelRequest, VercelResponse } from "@vercel/node";

const GROQ_API = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const languageNames: Record<string, string> = {
  en: "English", hi: "Hindi", mr: "Marathi", te: "Telugu", ta: "Tamil",
  bn: "Bengali", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return res.status(500).json({ error: "Server misconfiguration: GROQ_API_KEY missing" });

  const { cropType, soilType, season, region, language = "en" } = req.body;
  if (!cropType || !soilType) return res.status(400).json({ error: "cropType and soilType are required" });

  const langName = languageNames[language] || "English";

  try {
    const systemPrompt = `You are an expert agricultural scientist specializing in Indian farming (ICAR/IARI expertise). Provide scientifically accurate, practical crop analysis for Indian farmers based on the given parameters. Respond ONLY with valid JSON — no markdown, no explanation outside JSON.`;

    const userPrompt = `Crop Parameters:
- Crop Type: ${cropType}
- Soil Type: ${soilType}
- Season: ${season || 'Not specified'}
- Region: ${region || 'India'}

Analyze these parameters and provide a comprehensive crop analysis. Return this exact JSON structure (all text fields in ${langName}):
{
  "estimatedYield": "<description of expected yield or growth health in ${langName}>",
  "nutrientRequirements": "<recommended fertilizers/nutrients for this crop/soil combination in ${langName}>",
  "riskFactors": "<common pests/diseases or environmental risks to watch out for in ${langName}>",
  "bestPractices": "<2-3 key best practices for this crop in this season/region in ${langName}>"
}`;

    const response = await fetch(GROQ_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${groqKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.2,
      }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    return res.status(200).json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    console.error("Crop Analysis failed:", error);
    return res.status(500).json({ error: error.message || "Crop analysis failed" });
  }
}
