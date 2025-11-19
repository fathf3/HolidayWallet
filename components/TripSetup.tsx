import React, { useState } from 'react';
import { Trip, Currency } from '../types';
import { Users, Globe, Map, CheckCircle, Wallet } from 'lucide-react';

interface TripSetupProps {
  onSave: (tripData: Omit<Trip, 'id'>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const TripSetup: React.FC<TripSetupProps> = ({ onSave, onCancel, isLoading = false }) => {
  // Default dates (Today and 1 week later)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const [name, setName] = useState('Balkan Turu');
  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(nextWeek));
  const [peopleCount, setPeopleCount] = useState(2);
  const [baseCurrency, setBaseCurrency] = useState<Currency>(Currency.EUR);
  const [dailyBudgetLimit, setDailyBudgetLimit] = useState<string>('100'); // Default target

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;
    
    const newTripData: Omit<Trip, 'id'> = {
      name,
      startDate,
      endDate,
      peopleCount,
      baseCurrency,
      dailyBudgetLimit: dailyBudgetLimit ? parseFloat(dailyBudgetLimit) : 0
    };
    onSave(newTripData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            <Map size={32} /> HolidayWallet
          </h1>
          <p className="text-indigo-100 mt-2">Yeni bir macera oluştur</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tatil Adı</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="Örn: İtalya Turu"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kişi Sayısı</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  min="1"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(parseInt(e.target.value))}
                  className="pl-10 w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value as Currency)}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
              >
                {Object.values(Currency).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Budget Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Günlük Bütçe Hedefi ({baseCurrency})</label>
            <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="number"
                    min="0"
                    value={dailyBudgetLimit}
                    onChange={(e) => setDailyBudgetLimit(e.target.value)}
                    className="pl-10 w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                    placeholder="Örn: 100"
                />
                <p className="text-xs text-gray-500 mt-1 ml-1">Tüm grup için planlanan günlük harcama?</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-lg shadow-md transition duration-200 transform hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2"
            >
                {isLoading ? 'Oluşturuluyor...' : 'Tatili Başlat'} <CheckCircle size={20} />
            </button>
            
            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-sm text-gray-500 hover:text-gray-800 py-2"
                >
                    İptal
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripSetup;