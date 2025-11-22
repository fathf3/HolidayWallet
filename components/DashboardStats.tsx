import React, { useMemo } from 'react';
import { Trip, Expense, Currency } from '../types';
import { CURRENCY_SYMBOLS, getCategoryColor, convertCurrency } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface DashboardStatsProps {
  trip: Trip;
  expenses: Expense[];
  viewCurrency: Currency;
}

const COLORS_LOCATION = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A284F9', '#F984A8', '#84F9E9'];

const DashboardStats: React.FC<DashboardStatsProps> = ({ trip, expenses, viewCurrency }) => {
  const symbol = CURRENCY_SYMBOLS[viewCurrency];
  
  // Convert Daily Budget Limit to View Currency
  const dailyLimitRaw = trip.dailyBudgetLimit || 0;
  const dailyLimit = convertCurrency(dailyLimitRaw, trip.baseCurrency, viewCurrency);

  // --- Date Calculations ---
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  
  // Total Trip Duration (Days)
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Days Since First Expense (Days) - Used for "Actual Daily Average"
  const today = new Date();
  let daysPassed = 1;
  
  if (today < start) {
      daysPassed = 0; // Trip hasn't started
  } else if (today > end) {
      daysPassed = totalDays; // Trip finished
  } else {
      daysPassed = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }

  // --- Financial Calculations ---
  const totalSpent = useMemo(() => {
    return expenses.reduce((acc, curr) => {
      return acc + convertCurrency(curr.amount, curr.currency, viewCurrency);
    }, 0);
  }, [expenses, viewCurrency]);

  const dailyAverage = daysPassed > 0 ? totalSpent / daysPassed : 0;
  const costPerPerson = totalSpent / trip.peopleCount;
  
  // --- Chart Data Preparation ---
  
  // 1. By Category
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    expenses.forEach(e => {
      const amount = convertCurrency(e.amount, e.currency, viewCurrency);
      data[e.category] = (data[e.category] || 0) + amount;
    });
    return Object.keys(data).map(key => ({
      name: key,
      value: data[key]
    }));
  }, [expenses, viewCurrency]);

  // 2. By Location (City or Country)
  const locationData = useMemo(() => {
      const data: Record<string, number> = {};
      expenses.forEach(e => {
          const amount = convertCurrency(e.amount, e.currency, viewCurrency);
          // Use City if available, else Country, else 'Other'
          const loc = e.city || e.country || 'Diğer';
          data[loc] = (data[loc] || 0) + amount;
      });
      return Object.keys(data).map(key => ({
          name: key,
          value: data[key]
      }));
  }, [expenses, viewCurrency]);

  // 3. By Date (Daily History)
  const dailyHistoryData = useMemo(() => {
      const data: Record<string, number> = {};
      expenses.forEach(e => {
          const amount = convertCurrency(e.amount, e.currency, viewCurrency);
          data[e.date] = (data[e.date] || 0) + amount;
      });

      return Object.keys(data)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map(dateStr => {
            const dateObj = new Date(dateStr);
            return {
                date: dateStr,
                name: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`, // Format DD/M
                amount: data[dateStr]
            };
        });
  }, [expenses, viewCurrency]);

  // --- Budget Logic ---
  const budgetStatus = useMemo(() => {
      if (dailyLimit === 0) return { status: 'neutral', message: 'Günlük limit belirlenmedi.' };
      
      const diff = dailyLimit - dailyAverage;
      const percent = (dailyAverage / dailyLimit) * 100;

      if (percent > 100) {
          return { 
              status: 'danger', 
              message: `Bütçeyi aştınız! Günlük planlanandan ${Math.abs(diff).toFixed(0)} ${symbol} fazla harcıyorsunuz.` 
            };
      } else if (percent > 85) {
          return { 
              status: 'warning', 
              message: `Limite yaklaşıyorsunuz (%${percent.toFixed(0)}). Dikkatli olun.` 
            };
      } else {
          return { 
              status: 'success', 
              message: `Harika! Bütçenin altındasınız (%${percent.toFixed(0)}).` 
            };
      }
  }, [dailyLimit, dailyAverage, symbol]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* Left Column: Charts (Span 2) */}
      <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col h-[300px]">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Kategori Dağılımı</h3>
                <div className="flex-1 w-full">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toFixed(0)} ${symbol}`} />
                                <Legend wrapperStyle={{fontSize: '10px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-300 text-sm">Veri yok</div>
                    )}
                </div>
            </div>

            {/* Location Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col h-[300px]">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Konum Dağılımı</h3>
                <div className="flex-1 w-full">
                    {locationData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={locationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {locationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_LOCATION[index % COLORS_LOCATION.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toFixed(0)} ${symbol}`} />
                                <Legend wrapperStyle={{fontSize: '10px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-300 text-sm">Veri yok</div>
                    )}
                </div>
            </div>
          </div>

          {/* Daily History Chart (New) */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col h-[300px]">
             <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Günlük Harcama Akışı</h3>
             <div className="flex-1 w-full">
                {dailyHistoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="name" 
                                tick={{fontSize: 12}} 
                                axisLine={false} 
                                tickLine={false} 
                            />
                            <YAxis 
                                tick={{fontSize: 11}} 
                                axisLine={false} 
                                tickLine={false}
                            />
                            <Tooltip 
                                formatter={(value: number) => [`${value.toFixed(0)} ${symbol}`, 'Harcama']}
                                labelStyle={{ color: '#374151', fontWeight: 'bold'}}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Bar 
                                dataKey="amount" 
                                fill="#4f46e5" 
                                radius={[4, 4, 0, 0]} 
                                barSize={30}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-300 text-sm">Veri yok</div>
                )}
             </div>
          </div>
      </div>

      {/* Right Column: Stats & Budget (Span 1) */}
      <div className="md:col-span-1 space-y-4">
         
         {/* Main Stats Cards */}
         <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <p className="text-indigo-200 text-sm font-medium mb-1">Toplam Harcama</p>
            <p className="text-3xl font-bold">{totalSpent.toFixed(0)} <span className="text-lg opacity-70">{symbol}</span></p>
            
            <div className="mt-6 pt-6 border-t border-indigo-500/30 space-y-4">
                 <div>
                    <p className="text-indigo-200 text-xs uppercase font-bold">Kişi Başı</p>
                    <p className="text-xl font-semibold">{costPerPerson.toFixed(0)} {symbol}</p>
                 </div>
                 <div>
                    <p className="text-indigo-200 text-xs uppercase font-bold">Günlük Ortalama</p>
                    <p className="text-xl font-semibold">{dailyAverage.toFixed(0)} {symbol}</p>
                 </div>
            </div>
         </div>

         {/* Budget Analysis Card */}
         <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${
             budgetStatus.status === 'danger' ? 'border-red-500' :
             budgetStatus.status === 'warning' ? 'border-yellow-500' :
             budgetStatus.status === 'success' ? 'border-green-500' : 'border-gray-300'
         }`}>
             <h3 className="text-sm font-bold text-gray-800 uppercase mb-2">Bütçe Analizi</h3>
             
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Hedef (Günlük)</span>
                <span className="font-bold text-gray-900">{dailyLimit.toFixed(0)} {symbol}</span>
             </div>
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs text-gray-500">Gerçekleşen (Günlük)</span>
                <span className={`font-bold ${
                    budgetStatus.status === 'danger' ? 'text-red-600' :
                    budgetStatus.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                }`}>{dailyAverage.toFixed(0)} {symbol}</span>
             </div>
             
             <p className={`text-sm leading-relaxed ${
                 budgetStatus.status === 'danger' ? 'text-red-700' :
                 budgetStatus.status === 'warning' ? 'text-yellow-700' :
                 budgetStatus.status === 'success' ? 'text-green-700' : 'text-gray-600'
             }`}>
                 {budgetStatus.message}
             </p>
         </div>

         {/* Mini Info */}
         <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
             <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Süre</span>
                <span className="font-medium text-gray-900">{totalDays} Gün</span>
             </div>
             <div className="flex justify-between text-sm">
                <span className="text-gray-500">Geçen Zaman</span>
                <span className="font-medium text-gray-900">{daysPassed} Gün</span>
             </div>
         </div>
      </div>
    </div>
  );
};

export default DashboardStats;