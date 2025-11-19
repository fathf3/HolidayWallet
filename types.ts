export enum Currency {
  TRY = 'TRY',
  EUR = 'EUR',
  BAM = 'BAM', // Bosnia
  RSD = 'RSD', // Serbia
  MKD = 'MKD', // Macedonia
  ALL = 'ALL'  // Albania
}

export enum Category {
  Accommodation = 'Konaklama',
  Food = 'Yeme-İçme',
  Transport = 'Ulaşım',
  Activity = 'Aktivite',
  Shopping = 'Alışveriş',
  Other = 'Diğer'
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  peopleCount: number;
  baseCurrency: Currency;
  dailyBudgetLimit?: number; // User's target daily budget
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: Currency;
  category: Category;
  date: string;
  location: string; // City, Country format
  city: string;     // Parsed City
  country: string;  // Parsed Country
  amountInBaseCurrency?: number; // Calculated helper
}

export interface ExchangeRates {
  [key: string]: number; // Rate relative to Base
}