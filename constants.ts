import { Currency, Category, ExchangeRates } from './types';

// Simplified static rates relative to TRY for demo purposes.
// In a real app, fetch these live.
export const APPROX_RATES_TO_TRY: ExchangeRates = {
  [Currency.TRY]: 1,
  [Currency.USD]: 42.3,
  [Currency.EUR]: 49,
  [Currency.GBP]: 55.13,
  [Currency.BAM]: 25.08,
  [Currency.RSD]: 0.42,
  [Currency.MKD]: 0.79,
  [Currency.ALL]: 0.5
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

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.Accommodation]: '#8884d8',
  [Category.Food]: '#82ca9d',
  [Category.Transport]: '#ffc658',
  [Category.Activity]: '#ff8042',
  [Category.Shopping]: '#0088FE',
  [Category.Other]: '#aaaaaa'
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