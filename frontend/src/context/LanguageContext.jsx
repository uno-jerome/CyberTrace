import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import en from '../locales/en.json';
import fil from '../locales/fil.json';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'cybertrace_lang';
const SUPPORTED_LANGUAGES = ['en', 'fil'];

const dictionaries = {
  en,
  fil,
};

const resolvePath = (obj, path) => {
  if (!obj || typeof obj !== 'object') return null;
  const keys = path.split('.');
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return null;
    }
  }
  return typeof current === 'string' ? current : null;
};

const interpolate = (text, params) => {
  if (!params || typeof params !== 'object') return text;
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, match) => {
    return params[match] !== undefined ? String(params[match]) : `{{${match}}}`;
  });
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
        return saved;
      }
    } catch {
      // Ignore localStorage access restrictions
    }
    return 'en';
  });

  const setLanguage = useCallback((lang) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      setLanguageState(lang);
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Ignore write failures
      }
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'fil' : 'en');
  }, [language, setLanguage]);

  const t = useCallback(
    (key, paramsOrFallback = {}) => {
      const isParamObj = paramsOrFallback && typeof paramsOrFallback === 'object';
      const fallback = typeof paramsOrFallback === 'string' ? paramsOrFallback : key;

      let text = resolvePath(dictionaries[language], key);

      if (text === null && language !== 'en') {
        text = resolvePath(dictionaries.en, key);
      }

      if (text === null) {
        text = fallback;
      }

      return isParamObj ? interpolate(text, paramsOrFallback) : text;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isFilipino: language === 'fil',
      isEnglish: language === 'en',
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguage = useTranslation;

export default LanguageContext;
