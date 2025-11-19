import React, { useState } from 'react';
import { Category, Currency, Expense } from '../types';
import { PlusCircle, X, MapPin, Globe } from 'lucide-react';

interface ExpenseFormProps {
  tripId: string;
  onSave: (expense: Omit<Expense, 'amountInBaseCurrency'>) => void;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ tripId, onSave, onClose }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(Currency.TRY);
  const [category, setCategory] = useState<Category>(Category.Food);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Yeni ayrıştırılmış state'ler
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    // Konum verisini birleştir (Eski yapıyı bozmamak için)
    const locationCombined = (city && country) ? `${city}, ${country}` : (city || country || 'Bilinmiyor');

    onSave({
      id: crypto.randomUUID(),
      tripId,
      description,
      amount: parseFloat(amount),
      currency,
      category,
      date,
      country: country,
      city: city,
      location: locationCombined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Yeni Harcama Ekle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Harcama Adı / Ürün</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Örn: Akşam Yemeği"
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-gray-900"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tutar</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Para Birimi</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
              >
                {Object.values(Currency).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Kategori</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                >
                    {Object.values(Category).map((c) => (
                    <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
            <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tarih</label>
                 <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
                    required
                  />
            </div>
          </div>

          {/* Yeni Ülke ve Şehir Alanları */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ülke</label>
              <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Örn: İtalya"
                  className="w-full pl-9 p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-gray-900"
                  />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Şehir</label>
              <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Örn: Roma"
                  className="w-full pl-9 p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-gray-900"
                  />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 mt-4"
          >
            <PlusCircle size={20} />
            Harcama Ekle
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;