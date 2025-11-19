import { GoogleGenAI } from "@google/genai";
import { Trip, Expense, Currency } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const analyzeBudget = async (trip: Trip, expenses: Expense[], totalSpent: number) => {
  try {
    const ai = getClient();
    
    // Simplify expense data for the prompt to save tokens
    const expenseSummary = expenses.map(e => 
      `- ${e.date}: ${e.amount} ${e.currency}, Kategori: ${e.category}, Yer: ${e.location} (${e.description})`
    ).join('\n');

    const prompt = `
      Sen bir seyahat bütçe asistanısın. Aşağıdaki tatil verilerini analiz et:
      
      Tatil Adı: ${trip.name}
      Kişi Sayısı: ${trip.peopleCount}
      Tarihler: ${trip.startDate} - ${trip.endDate}.
      Ana Para Birimi: ${trip.baseCurrency}
      Şu ana kadar harcanan (Yaklaşık ${trip.baseCurrency}): ${totalSpent.toFixed(2)}
      
      Harcama Listesi:
      ${expenseSummary}
      
      Lütfen Türkçe olarak kısa ve öz bir Markdown analizi yap:
      1. **Bütçe Durumu**: Bu bölge (${trip.name}) için harcamalar makul mü? Pahalı mı?
      2. **Tasarruf İpucu**: Hangi kategori yüksek görünüyor ve nasıl tasarruf edebilirler?
      3. **Tahmin**: Bu hızla giderlerse tatil sonunda tahmini toplam ne olur?
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini error:", error);
    return "Üzgünüm, Yapay Zeka analizi şu an yapılamıyor. Lütfen API anahtarını kontrol et veya daha sonra tekrar dene.";
  }
};

export const suggestActivity = async (location: string) => {
   try {
    const ai = getClient();
    const prompt = `Şu anda buradayım: ${location}. Bir turist için düşük maliyetli ama keyifli 3 aktivite önerir misin? Kısa tut. Cevabı Türkçe ver.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
   } catch (e) {
     return "Öneri alınamadı.";
   }
};