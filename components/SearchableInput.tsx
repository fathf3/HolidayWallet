import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock } from 'lucide-react';

interface SearchableInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  recentItems: string[]; // Last 3 items
  placeholder?: string;
  icon?: React.ReactNode;
}

const SearchableInput: React.FC<SearchableInputProps> = ({
  label,
  value,
  onChange,
  options,
  recentItems,
  placeholder,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter options based on input
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase()) && !recentItems.includes(opt)
  );

  const filteredRecents = recentItems.filter(opt =>
    opt.toLowerCase().includes(value.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div ref={wrapperRef} className="relative">
        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
            
            <input
                type="text"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className={`${icon ? 'pl-9' : 'pl-3'} pr-8 w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-gray-900`}
            />
            
            <div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                <ChevronDown size={16} />
            </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in">
                
                {/* Recent Items Section */}
                {filteredRecents.length > 0 && (
                    <div className="border-b border-gray-100">
                        <div className="px-3 py-2 text-xs font-bold text-indigo-500 bg-indigo-50 flex items-center gap-1">
                             <Clock size={12} /> SON SEÇİLENLER
                        </div>
                        {filteredRecents.map((item) => (
                            <div
                                key={`recent-${item}`}
                                onClick={() => {
                                    onChange(item);
                                    setIsOpen(false);
                                }}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-800 flex justify-between items-center"
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                )}

                {/* All Options Section */}
                <div className="py-1">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((item) => (
                            <div
                                key={item}
                                onClick={() => {
                                    onChange(item);
                                    setIsOpen(false);
                                }}
                                className="px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm text-gray-700"
                            >
                                {item}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-xs text-gray-400 italic">
                            {value ? `"${value}" yeni olarak eklenecek` : 'Sonuç bulunamadı'}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default SearchableInput;