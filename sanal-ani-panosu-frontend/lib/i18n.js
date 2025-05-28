'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Create the i18n context
const I18nContext = createContext();

// Hook to use i18n context
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Supported languages
export const LANGUAGES = {
  en: 'English',
  tr: 'Türkçe'
};

// Default language
const DEFAULT_LANGUAGE = 'en';

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = 'muru_language';

// Function to load translation file
const loadTranslations = async (locale) => {
  try {
    const translations = await import(`@/locales/${locale}/common.json`);
    return translations.default;
  } catch (error) {
    console.warn(`Failed to load translations for locale: ${locale}, falling back to English`);
    if (locale !== 'en') {
      return await loadTranslations('en');
    }
    return {};
  }
};

// Function to get nested translation value
const getTranslation = (translations, key, fallback = key) => {
  if (!key || typeof key !== 'string') return fallback;
  
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback;
    }
  }
  
  return typeof value === 'string' ? value : fallback;
};

// I18n Provider Component
export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when locale changes
  useEffect(() => {
    const loadLocaleTranslations = async () => {
      setIsLoading(true);
      try {
        const newTranslations = await loadTranslations(locale);
        setTranslations(newTranslations);
      } catch (error) {
        console.error('Error loading translations:', error);
        setTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    loadLocaleTranslations();
  }, [locale]);

  // Load saved language preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && savedLanguage in LANGUAGES) {
        setLocale(savedLanguage);
      } else {
        // Try to detect browser language
        const browserLanguage = navigator.language.split('-')[0];
        if (browserLanguage in LANGUAGES) {
          setLocale(browserLanguage);
        }
      }
    }
  }, []);

  // Function to change language
  const changeLanguage = (newLocale) => {
    if (newLocale in LANGUAGES) {
      setLocale(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
      }
    }
  };

  // Translation function
  const t = (key, fallback) => {
    return getTranslation(translations, key, fallback || key);
  };

  const value = {
    locale,
    changeLanguage,
    t,
    isLoading,
    languages: LANGUAGES
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export default I18nProvider;
