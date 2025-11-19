import React, { useMemo } from 'react';
import { Trip, Expense, Currency, Category } from '../types';
import { CURRENCY_SYMBOLS, CATEGORY_COLORS, convertCurrency } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DashboardStatsProps {
  trip: Trip;
  expenses: Expense[];
  viewCurrency: Currency;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ trip, expenses, viewCurrency }) => {
  const symbol = CURRENCY_SYMBOLS[viewCurrency];

  // --- Date Calculations ---
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  
  // 1. Total Trip Duration (Days) - Used for "General Daily Average" (Budgeting)
  // Adding 1 to include the end date as a full day
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // 2. Days Since First Expense (Days) - Used for "Actual Daily Average" (Burn Rate)
  // Logic: Find the earliest expense date. If no expenses, use trip start date.
  const earliestExpenseDateStr = expenses.length > 0
    ? expenses.reduce((min, curr) => curr.date < min ? curr.date : min, expenses[0].date)
    : trip.startDate;

  const firstExpenseDate = new Date(earliestExpenseDateStr);
  const today = new Date();
  
  // Normalize times to midnight for accurate day diff counting
  firstExpenseDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Calculate days passed since the first expense (including today)
  let daysSinceSpendingStarted = Math.floor((today.getTime() - firstExpenseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  // Constraints:
  // - Cannot be less than 1 (avoid division by zero)
  daysSinceSpendingStarted = Math.max(1, daysSinceSpendingStarted);

  // --- Financial Calculations ---
  const totalSpent = useMemo(() => {
      return expenses.reduce((acc, curr) => {
          return acc + convertCurrency(curr.amount, curr.currency, viewCurrency);
      }, 0);
  }, [expenses, viewCurrency]);

  const dailyAverageTotal = totalSpent / totalDays; // General Plan (Total / Trip Duration)
  const dailyAverageActual = totalSpent / daysSinceSpendingStarted; // Real Burn Rate (Total / Days since first payment)
  const perPerson = totalSpent / trip.peopleCount;

  // --- Chart Data ---
  const categoryData = useMemo(() => {
    const data = expenses.reduce((acc, curr) => {
        const amount = convertCurrency(curr.amount, curr.currency, viewCurrency);
        if (!acc[curr.category]) {
          acc[curr.category] = { name: curr.category, value: 0 };
        }
        acc[curr.category].value += amount;
        return acc;
      }, {} as Record<string, { name: Category; value: number }>);
      
    return Object.values(data);
  }, [expenses, viewCurrency]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Total Spent */}
      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-indigo-500">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Toplam Harcama</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{symbol}{totalSpent.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h3>
        <p className="text-xs text-gray-400 mt-1">{viewCurrency} bazında</p>
      </div>

      {/* Card 2: Actual Daily Average (Burn Rate) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-rose-500">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Güncel Günlük Ort.</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{symbol}{dailyAverageActual.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h3>
        <p className="text-xs text-gray-400 mt-1">İlk harcamadan beri ({daysSinceSpendingStarted} gün)</p>
      </div>

      {/* Card 3: Planned Daily Average (Budget) */}
      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-green-500">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Genel Günlük Ort.</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{symbol}{dailyAverageTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h3>
        <p className="text-xs text-gray-400 mt-1">Toplam tatil süresi ({totalDays} gün)</p>
      </div>

      {/* Card 4: Per Person */}
      <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-orange-500">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Kişi Başı Maliyet</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{symbol}{perPerson.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</h3>
        <p className="text-xs text-gray-400 mt-1">{trip.peopleCount} kişi</p>
      </div>

      {/* Charts Section */}
      {expenses.length > 0 && (
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="font-semibold text-gray-700 mb-4">Kategori Dağılımı ({viewCurrency})</h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#8884d8'} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${symbol}${value.toFixed(0)}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {categoryData.map((entry) => (
                        <div key={entry.name} className="flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                            <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: CATEGORY_COLORS[entry.name] || '#8884d8' }}></span>
                            {entry.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Simple Advice Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl shadow-sm text-white flex flex-col justify-center">
                <h4 className="font-semibold text-lg mb-2">Hızlı İstatistikler</h4>
                <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex justify-between">
                        <span>Toplam İşlem:</span>
                        <span className="font-bold text-white">{expenses.length}</span>
                    </li>
                    <li className="flex justify-between">
                        <span>En Yüksek Harcama:</span>
                        <span className="font-bold text-white">
                            {expenses.length > 0 ? Math.max(...expenses.map(e => convertCurrency(e.amount, e.currency, viewCurrency))).toFixed(0) : 0} {symbol}
                        </span>
                    </li>
                    <li className="flex justify-between">
                        <span>En Çok Harcanan Yer:</span>
                         <span className="font-bold text-white">
                            {expenses.length > 0 ? 
                                Object.entries(expenses.reduce((acc, curr) => {
                                    acc[curr.location] = (acc[curr.location] || 0) + 1;
                                    return acc;
                                }, {} as any)).sort((a:any, b:any) => b[1] - a[1])[0]?.[0] 
                            : '-'}
                         </span>
                    </li>
                    <li className="pt-4 border-t border-slate-700 mt-2">
                        <p className="text-xs text-slate-400">
                            {dailyAverageActual > dailyAverageTotal 
                                ? "⚠️ Dikkat: Harcamalarınız başladığından beri günlük ortalamanız, genel bütçe ortalamasının üzerinde."
                                : "✅ Harika: Planlanan günlük ortalamanın altında harcıyorsunuz."}
                        </p>
                    </li>
                </ul>
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;