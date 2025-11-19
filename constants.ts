import { Currency, Category, ExchangeRates } from './types';

// Simplified static rates relative to TRY for demo purposes.
// In a real app, fetch these live.
export const APPROX_RATES_TO_TRY: ExchangeRates = {
  [Currency.TRY]: 1,
  [Currency.USD]: 34.5,
  [Currency.EUR]: 36.5,
  [Currency.GBP]: 43.5,
  [Currency.BAM]: 18.5,
  [Currency.RSD]: 0.31,
  [Currency.MKD]: 0.60,
  [Currency.ALL]: 0.37
};

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
    if (from === to) return amount;
    const rateFrom = APPROX_RATES_TO_TRY[from];
    const rateTo = APPROX_RATES_TO_TRY[to];
    if (!rateFrom || !rateTo) return amount;
    
    // Convert to TRY first, then to Target
    const inTry = amount * rateFrom;
    return inTry / rateTo;
};

// Robust color map handling both Turkish (current) and English (legacy) keys
export const CATEGORY_COLORS: Record<string, string> = {
  // Turkish
  'Konaklama': '#8884d8',
  'Yeme-İçme': '#82ca9d',
  'Ulaşım': '#ffc658',
  'Aktivite': '#ff8042',
  'Alışveriş': '#0088FE',
  'Diğer': '#aaaaaa',

  // English/Legacy Fallbacks (for existing data compatibility)
  'Accommodation': '#8884d8',
  'Food': '#82ca9d',
  'Food & Drink': '#82ca9d',
  'Transport': '#ffc658',
  'Activity': '#ff8042',
  'Shopping': '#0088FE',
  'Other': '#aaaaaa'
};

export const getCategoryColor = (category: string): string => {
    return CATEGORY_COLORS[category] || '#aaaaaa';
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.TRY]: '₺',
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
  [Currency.GBP]: '£',
  [Currency.BAM]: 'KM',
  [Currency.RSD]: 'дин',
  [Currency.MKD]: 'den',
  [Currency.ALL]: 'Lek'
};