'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('pt'); // default PT for SSR

  useEffect(() => {
    // 1. Check localStorage first
    const saved = localStorage.getItem('reflexy-lang');
    if (saved === 'pt' || saved === 'en') {
      setLang(saved);
      return;
    }
    // 2. Auto-detect from browser
    const browserLang = navigator.language || navigator.userLanguage || 'pt';
    setLang(browserLang.toLowerCase().startsWith('pt') ? 'pt' : 'en');
  }, []);

  const switchLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('reflexy-lang', newLang);
  };

  const t = (key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) val = val?.[k];
    // fallback to PT
    if (val === undefined) {
      let ptVal = translations['pt'];
      for (const k of keys) ptVal = ptVal?.[k];
      return ptVal ?? key;
    }
    return val;
  };

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback if used outside provider (should not happen in normal flow)
    const t = (key) => {
      const keys = key.split('.');
      let val = translations['pt'];
      for (const k of keys) val = val?.[k];
      return val ?? key;
    };
    return { lang: 'pt', switchLang: () => {}, t };
  }
  return ctx;
}
