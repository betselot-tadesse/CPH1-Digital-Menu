
import React from 'react';
import { LANGUAGES } from '../constants';
import { Language } from '../types';

interface Props {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageToggle: React.FC<Props> = ({ currentLang, onLanguageChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 whitespace-nowrap ${
            currentLang === lang.code
              ? 'bg-blue-600 text-white shadow-md scale-105'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span className="text-lg">{lang.flag}</span>
          <span className="font-medium">{lang.label}</span>
        </button>
      ))}
    </div>
  );
};
