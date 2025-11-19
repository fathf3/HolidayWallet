import React, { useState } from 'react';
import { LogIn, ArrowRight, Search } from 'lucide-react';

interface JoinTripProps {
    onJoin: (code: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const JoinTrip: React.FC<JoinTripProps> = ({ onJoin, onCancel, isLoading }) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            onJoin(code.trim().toUpperCase());
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-slate-800 p-6 text-center">
                    <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                        <LogIn size={28} /> Tura Katıl
                    </h2>
                    <p className="text-slate-300 mt-2 text-sm">Arkadaşınızdan aldığınız Tur Kodunu girin.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tur Kodu</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="pl-10 w-full p-4 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-gray-900 text-lg font-bold tracking-widest uppercase placeholder:tracking-normal placeholder:font-normal"
                                placeholder="Örn: TUR-X9Y2"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md transition duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Aranıyor...' : 'Tura Git'} <ArrowRight size={20} />
                        </button>
                        
                        <button
                            type="button"
                            onClick={onCancel}
                            className="text-sm text-gray-500 hover:text-gray-800 py-2"
                        >
                            Geri Dön
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinTrip;