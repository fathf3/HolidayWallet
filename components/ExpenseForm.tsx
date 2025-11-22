import React, { useState, useEffect } from 'react';
import { Category, Currency, Expense } from '../types';
import { PlusCircle, X, MapPin, Globe } from 'lucide-react';
import { DESTINATIONS } from '../constants';
import SearchableInput from './SearchableInput';

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
  
  // Location states
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');

  // Recent History State
  const [recentCountries, setRecentCountries] = useState<string[]>([]);
  const [recentCities, setRecentCities] = useState<string[]>([]);

  // Load recents from LocalStorage on mount
  useEffect(() => {
    try {
        const savedRecents = localStorage.getItem('hw_recent_locations');
        if (savedRecents) {
            const parsed = JSON.parse(savedRecents);
            if (parsed.countries) setRecentCountries(parsed.countries);
            if (parsed.cities) setRecentCities(parsed.cities);
        }
    } catch (e) {
        console.error("Error loading recent locations", e);
    }
  }, []);

  // Save to recents logic
  const updateRecents = (newCountry: string, newCity: string) => {
      const updateList = (list: string[], item: string) => {
          if (!item) return list;
          const filtered = list.filter(i => i !== item); // Remove duplicate if exists
          return [item, ...filtered].slice(0, 3); // Add to top, keep max 3
      };

      const updatedCountries = updateList(recentCountries, newCountry);
      const updatedCities = updateList(recentCities, newCity);

      setRecentCountries(updatedCountries);
      setRecentCities(updatedCities);

      localStorage.setItem('hw_recent_locations', JSON.stringify({
          countries: updatedCountries,
          cities: updatedCities
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    // Update history
    updateRecents(country, city);

    // Combine location data
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

  // Determine City Options based on Country
  const cityOptions = country && DESTINATIONS[country] ? DESTINATIONS[country] : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in h-[90vh] overflow-y-auto md:h-auto">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-800">Harcama Ekle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Açıklama</label>
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

          {/* Smart Location Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <SearchableInput 
                label="Ülke"
                value={country}
                onChange={setCountry}
                options={Object.keys(DESTINATIONS)}
                recentItems={recentCountries}
                placeholder="Örn: İtalya"
                icon={<Globe size={16} />}
            />
            
            <SearchableInput 
                label="Şehir"
                value={city}
                onChange={setCity}
                options={cityOptions}
                recentItems={recentCities}
                placeholder="Örn: Roma"
                icon={<MapPin size={16} />}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 mt-4"
          >
            <PlusCircle size={20} />
            Ekle
          </button>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;