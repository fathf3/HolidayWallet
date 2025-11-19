import React, { useState, useEffect } from 'react';
import { Trip, Expense, Currency } from './types';
import { convertCurrency, getCategoryColor } from './constants';
import TripSetup from './components/TripSetup';
import DashboardStats from './components/DashboardStats';
import ExpenseForm from './components/ExpenseForm';
import JoinTrip from './components/JoinTrip';
import { Plus, Map, LogOut, Wallet, Copy, Check } from 'lucide-react';
import { db } from './services/storage';

type AppMode = 'landing' | 'create' | 'join' | 'dashboard';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('landing');
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);
  const [viewCurrency, setViewCurrency] = useState<Currency>(Currency.TRY);
  const [copied, setCopied] = useState(false);

  // Check active session on load
  useEffect(() => {
    const lastTripId = localStorage.getItem('active_trip_id');
    if (lastTripId) {
      loadTrip(lastTripId);
    }
  }, []);

  // Load trip from DB
  const loadTrip = async (tripId: string) => {
    setLoadingDb(true);
    try {
        const tripData = await db.getTrip(tripId);
        if (tripData) {
            const expenseData = await db.getExpenses(tripId);
            setTrip(tripData);
            setExpenses(expenseData);
            setViewCurrency(tripData.baseCurrency);
            setMode('dashboard');
            // Remember session
            localStorage.setItem('active_trip_id', tripId);
        } else {
            alert('Tatil bulunamadı.');
            setMode('landing');
            localStorage.removeItem('active_trip_id');
        }
    } catch (error) {
        console.error(error);
        alert('Veri yüklenirken hata oluştu.');
    } finally {
        setLoadingDb(false);
    }
  };

  const handleCreateTrip = async (tripData: Omit<Trip, 'id'>) => {
    setLoadingDb(true);
    try {
        const newTrip = await db.createTrip(tripData);
        await loadTrip(newTrip.id);
    } catch (error) {
        alert("Tatil oluşturulamadı.");
    } finally {
        setLoadingDb(false);
    }
  };

  const handleJoinTrip = async (code: string) => {
      await loadTrip(code);
  };

  const handleExitTrip = () => {
    // Exit directly
    try {
        localStorage.removeItem('active_trip_id');
    } catch (e) {
        console.error("Storage clear error", e);
    }
    setMode('landing');
    setTrip(null);
    setExpenses([]);
  };

  const handleAddExpense = async (rawExpense: Omit<Expense, 'amountInBaseCurrency'>) => {
    if (!trip) return;
    
    const amountInBaseCurrency = convertCurrency(rawExpense.amount, rawExpense.currency, trip.baseCurrency);
    const expensePayload: Expense = { ...rawExpense, amountInBaseCurrency };

    // Optimistic UI update
    setExpenses(prev => [expensePayload, ...prev]);

    // Save to DB
    await db.addExpense(expensePayload);
  };

  const handleDeleteExpense = async (id: string) => {
    if(!trip) return;
    
    if (window.confirm('Bu harcamayı silmek istediğinize emin misiniz?')) {
        // Optimistic UI
        setExpenses(prev => prev.filter(e => e.id !== id));
        await db.deleteExpense(trip.id, id);
    }
  };

  const copyTripCode = () => {
      if(!trip) return;
      navigator.clipboard.writeText(trip.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // --- Landing Screen ---
  if (mode === 'landing') {
      return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
              <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                  {/* Left Image/Brand Area */}
                  <div className="md:w-1/2 bg-indigo-600 p-10 text-white flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover opacity-20"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Map size={32} />
                                </div>
                                <h1 className="text-4xl font-bold">HolidayWallet</h1>
                            </div>
                            <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                                Seyahat bütçenizi yönetmenin en akıllı yolu. Harcamaları takip edin, arkadaşlarınızla paylaşın ve tatilinizin keyfini çıkarın.
                            </p>
                            <div className="flex gap-3 text-sm font-medium text-indigo-200">
                                <span className="px-3 py-1 bg-white/10 rounded-full">✈️ Tatil Planlayıcı</span>
                                <span className="px-3 py-1 bg-white/10 rounded-full">💰 Bütçe Takip</span>
                            </div>
                        </div>
                  </div>

                  {/* Right Action Area */}
                  <div className="md:w-1/2 p-10 flex flex-col justify-center bg-gray-50">
                      <div className="space-y-4">
                          <button 
                            onClick={() => setMode('create')}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-xl shadow-lg font-bold text-lg transition transform hover:scale-[1.02] flex items-center justify-between group"
                          >
                              <span>Yeni Tatil Oluştur</span>
                              <span className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition"><Plus size={24} /></span>
                          </button>
                          
                          <div className="relative flex py-2 items-center">
                              <div className="flex-grow border-t border-gray-300"></div>
                              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">veya</span>
                              <div className="flex-grow border-t border-gray-300"></div>
                          </div>

                          <button 
                            onClick={() => setMode('join')}
                            className="w-full bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700 p-5 rounded-xl font-bold text-lg transition flex items-center justify-between group"
                          >
                             <span>Mevcut Tatile Katıl</span>
                             <span className="text-gray-400 group-hover:text-indigo-500 transition"><LogOut size={24} className="rotate-180" /></span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  if (mode === 'create') {
      return <TripSetup onSave={handleCreateTrip} onCancel={() => setMode('landing')} isLoading={loadingDb} />;
  }

  if (mode === 'join') {
      return <JoinTrip onJoin={handleJoinTrip} onCancel={() => setMode('landing')} isLoading={loadingDb} />;
  }

  // --- Dashboard Mode ---
  if (!trip) return null; 

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <header className="bg-indigo-700 text-white sticky top-0 z-40 shadow-lg transition-all">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex-1 w-full md:w-auto">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                        <Map size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">{trip.name}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs bg-indigo-800 px-2 py-0.5 rounded text-indigo-200 font-mono border border-indigo-600 flex items-center gap-1 cursor-pointer hover:bg-indigo-600 transition" onClick={copyTripCode} title="Kodu Kopyala">
                                {trip.id}
                                {copied ? <Check size={10} /> : <Copy size={10} />}
                            </span>
                            <span className="text-xs text-indigo-200 opacity-80">• {trip.peopleCount} Kişi</span>
                        </div>
                    </div>
                </div>
                <button 
                    type="button"
                    onClick={handleExitTrip}
                    className="md:hidden p-2 bg-indigo-800 hover:bg-rose-600 rounded-lg text-xs transition cursor-pointer active:scale-95"
                >
                    <LogOut size={16} />
                </button>
             </div>
          </div>

          {/* Currency Switcher & Desktop Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex items-center bg-indigo-800 rounded-lg px-3 py-1.5 border border-indigo-600 flex-1 md:flex-none">
                <Wallet size={16} className="text-indigo-300 mr-2" />
                <span className="text-xs text-indigo-300 mr-2 whitespace-nowrap">Görünüm:</span>
                <select 
                    value={viewCurrency}
                    onChange={(e) => setViewCurrency(e.target.value as Currency)}
                    className="bg-transparent text-white text-sm font-bold outline-none cursor-pointer appearance-none pr-4"
                >
                    {Object.values(Currency).map(c => (
                        <option key={c} value={c} className="text-gray-900">{c}</option>
                    ))}
                </select>
            </div>

            <button 
                type="button"
                onClick={handleExitTrip}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-800 hover:bg-rose-600 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer active:scale-95"
            >
                <LogOut size={16} /> Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <DashboardStats trip={trip} expenses={expenses} viewCurrency={viewCurrency} />

        {/* Actions Bar */}
        <div className="flex gap-3 mb-6">
            <button 
                type="button"
                onClick={() => setShowExpenseForm(true)}
                className="w-full bg-black text-white py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition transform hover:scale-[1.02]"
            >
                <Plus size={20} /> Harcama Ekle
            </button>
        </div>

        {/* Expense List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-end">
            <h2 className="font-bold text-gray-800 text-lg">Harcama Geçmişi</h2>
            <span className="text-xs text-gray-400">{expenses.length} işlem</span>
          </div>
          
          {expenses.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <p>Henüz harcama eklenmedi.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {expenses.map((expense) => {
                  const displayAmount = convertCurrency(expense.amount, expense.currency, viewCurrency);
                  
                  return (
                    <li key={expense.id} className="px-6 py-4 hover:bg-gray-50 transition flex justify-between items-center group">
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-sm shrink-0`} 
                            style={{ backgroundColor: getCategoryColor(expense.category) }}>
                        {expense.category.charAt(0)}
                        </div>
                        <div>
                        <p className="font-medium text-gray-800">{expense.description}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            {expense.date} • {expense.location}
                        </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-medium text-gray-500">
                           ({expense.amount.toFixed(2)} {expense.currency})
                        </span>
                        <span className="font-bold text-gray-900 text-lg">
                           {displayAmount.toFixed(2)} {viewCurrency}
                        </span>
                        
                        <button 
                            type="button"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs mt-1"
                        >
                            Sil
                        </button>
                    </div>
                    </li>
                  );
              })}
            </ul>
          )}
        </div>
      </main>

      {showExpenseForm && trip && (
        <ExpenseForm 
            tripId={trip.id} 
            onSave={handleAddExpense} 
            onClose={() => setShowExpenseForm(false)} 
        />
      )}
    </div>
  );
};

export default App;