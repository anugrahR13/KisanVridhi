import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '../context/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:bg-emerald-50 transition-all cursor-pointer"
        title="Switch UI Language"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
        <span className="text-sm">{selectedLang.flag}</span>
        <span className="hidden sm:inline font-bold">{selectedLang.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-scale-in">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100 tracking-wider">
            Select Language / भाषा चुनें
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as SupportedLanguage);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-left transition-colors cursor-pointer ${
                  isActive ? 'bg-emerald-50 text-emerald-900 font-extrabold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-base">{lang.flag}</span>
                  <div>
                    <span className="block text-xs leading-none">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{lang.name}</span>
                  </div>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
