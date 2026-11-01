import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface PredictionResult {
  openingPrice: number;
  predictedClose: number;
  percentChange: number;
  confidence: number;
  reasoning: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  keyFactors: string[];
}

export const predictStockPrice = async (
  news: string,
  stockSymbol: string,
  historicalContext: string,
  date: string
): Promise<PredictionResult> => {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `
    You are an expert financial analyst and stock price predictor.
    Your task is to analyze daily news and historical context to predict the closing price of a specific stock.
    
    Historical Context (2021-2022):
    ${historicalContext}
    
    Guidelines:
    1. Use the provided date (${date}) to find the actual opening price for ${stockSymbol} on that day using Google Search if you don't already know it.
    2. Analyze the sentiment of the news (Bullish, Bearish, or Neutral).
    3. Consider how similar news events in 2021-2022 affected the market.
    4. Provide the opening price, a specific predicted closing price, and the calculated percentage change.
    5. Explain your reasoning clearly, citing specific factors from the news and historical correlations.
    6. Provide a confidence score between 0 and 1.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: `On ${date}, predict the closing price for ${stockSymbol} given this news: ${news}`,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          openingPrice: { type: Type.NUMBER, description: "The actual or estimated opening price for the stock on the given date." },
          predictedClose: { type: Type.NUMBER, description: "The predicted closing price for the stock." },
          percentChange: { type: Type.NUMBER, description: "The predicted percentage change from open to close." },
          confidence: { type: Type.NUMBER },
          reasoning: { type: Type.STRING },
          sentiment: { type: Type.STRING, enum: ['bullish', 'bearish', 'neutral'] },
          keyFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["openingPrice", "predictedClose", "percentChange", "confidence", "reasoning", "sentiment", "keyFactors"]
      }
    }
  });

  return JSON.parse(response.text);
};
