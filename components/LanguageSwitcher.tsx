import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../lib/LanguageContext';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
  shortLabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: 'fr',
    label: 'Français',
    nativeLabel: 'Français',
    flag: '🇫🇷',
    shortLabel: 'FR'
  },
  {
    code: 'zh',
    label: 'Chinois',
    nativeLabel: '中文',
    flag: '🇨🇳',
    shortLabel: '中文'
  },
  {
    code: 'en',
    label: 'Anglais',
    nativeLabel: 'English',
    flag: '🇬🇧',
    shortLabel: 'EN'
  }
];

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'mobile';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'pill',
  className = ''
}) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // VARIANT 1: PILL (Segmented control for desktop nav)
  if (variant === 'pill') {
    return (
      <div 
        role="radiogroup" 
        aria-label="Sélection de la langue / Language selector"
        className={`inline-flex items-center bg-gray-50/90 hover:bg-gray-100/90 rounded-full p-1 border border-purple-100/80 shadow-xs transition-colors duration-200 ${className}`}
      >
        <span className="sr-only">Choisir la langue</span>
        <div className="pl-1.5 pr-0.5 text-gray-400">
          <Globe className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
        {LANGUAGES.map((opt) => {
          const isSelected = language === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setLanguage(opt.code)}
              className={`relative px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                isSelected
                  ? 'bg-primary text-white shadow-xs font-extrabold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
              title={`${opt.nativeLabel} (${opt.label})`}
            >
              <span className="text-[11px] leading-none">{opt.flag}</span>
              <span className="tracking-tight leading-none text-[11px]">{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // VARIANT 2: MOBILE (Direct clean select or button group)
  if (variant === 'mobile') {
    return (
      <div className={`relative inline-flex items-center ${className}`}>
        <label htmlFor="mobile-language-select" className="sr-only">
          Changer la langue / Change language
        </label>
        <div className="relative flex items-center">
          <Globe className="absolute left-2.5 w-3.5 h-3.5 text-purple-600 pointer-events-none" />
          <select
            id="mobile-language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="appearance-none bg-purple-50/80 text-gray-800 text-xs font-bold border border-purple-150 rounded-full py-1.5 pl-8 pr-7 outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer shadow-xs"
          >
            {LANGUAGES.map((opt) => (
              <option key={opt.code} value={opt.code} className="bg-white text-gray-900 font-medium">
                {opt.flag} {opt.nativeLabel} ({opt.shortLabel})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    );
  }

  // VARIANT 3: DROPDOWN (Interactive dropdown popup with full native labels)
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Langue actuelle : ${currentOption.nativeLabel}. Cliquez pour changer.`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/90 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-purple-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
      >
        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-xs">{currentOption.flag}</span>
        <span className="font-bold text-gray-800">{currentOption.nativeLabel}</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Options de langue"
          className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white shadow-lg border border-purple-100 py-1 z-50 animate-fade-in focus:outline-none"
        >
          <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Langue / Language / 语言
          </div>
          {LANGUAGES.map((opt) => {
            const isSelected = language === opt.code;
            return (
              <button
                key={opt.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(opt.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors text-left ${
                  isSelected
                    ? 'bg-purple-50/80 text-primary font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{opt.flag}</span>
                  <div>
                    <span className="block text-xs font-bold text-gray-900 leading-tight">{opt.nativeLabel}</span>
                    <span className="block text-[10px] text-gray-400">{opt.label}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
