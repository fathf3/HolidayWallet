export enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  BAM = 'BAM', // Bosnia
  RSD = 'RSD', // Serbia
  MKD = 'MKD', // Macedonia
  ALL = 'ALL'  // Albania
}

export enum Category {
  Accommodation = 'Konaklama',
  Food = 'Yeme-İçme',
  Transport = 'Ulaşım',
  Activity = 'Aktivite/Müze',
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
  dailyBudgetLimit?: number; // Kullanıcının hedeflediği günlük harcama limiti
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: Currency;
  category: Category;
  date: string;
  location: string; // City, Country formatında tutulmaya devam eder
  city: string;     // Ayrıştırılmış Şehir
  country: string;  // Ayrıştırılmış Ülke
  amountInBaseCurrency?: number; // Calculated helper
}

export interface ExchangeRates {
  [key: string]: number; // Rate relative to Base (simplified)
}