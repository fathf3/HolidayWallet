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
      `- ${e.date}: ${e.amount} ${e.currency} for ${e.category} in ${e.location} (${e.description})`
    ).join('\n');

    const prompt = `
      Bir seyahat bütçesi asistanısın. Aşağıdaki tatil verilerini analiz et:
      
      Tatil Adı: ${trip.name}
      Kişi Sayısı: ${trip.peopleCount}
      Tarihler: ${trip.startDate} ile ${trip.endDate} arası.
      Ana Para Birimi: ${trip.baseCurrency}
      Şu ana kadar toplam harcama (Tahmini ${trip.baseCurrency} cinsinden): ${totalSpent.toFixed(2)}
      
      Harcama Listesi:
      ${expenseSummary}
      
      Lütfen şu formatta kısa ve öz bir analiz yap (Türkçe):
      1. **Bütçe Durumu**: Harcamalar bu bölge (${trip.name}) için makul mü? Pahalı mı?
      2. **Tasarruf İpucu**: Hangi kategoride harcama yüksek görünüyor ve nasıl kısılabilir?
      3. **Tahmin**: Bu hızla gidilirse tatil sonu toplam ne kadar harcanır?
      
      Cevabı markdown formatında ver.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini error:", error);
    return "Üzgünüm, şu anda yapay zeka analizi yapılamıyor. Lütfen API anahtarını kontrol edin veya daha sonra tekrar deneyin.";
  }
};

export const suggestActivity = async (location: string) => {
   try {
    const ai = getClient();
    const prompt = `Şu an ${location} konumundayım. Turist olarak yapabileceğim düşük maliyetli ama keyifli 3 aktivite önerir misin? Kısa cevap ver.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
   } catch (e) {
     return "Öneri alınamadı.";
   }
};