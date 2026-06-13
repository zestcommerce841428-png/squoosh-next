'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Translation type
export interface Translations {
  [key: string]: string | Translations;
}

// Language context type
interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  translations: Translations;
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Supported languages (38 total)
export const SUPPORTED_LANGUAGES = [
  'en-US', 'zh-CN', 'es-ES', 'hi-IN', 'ar-SA', 'bn-BD', 'pt-BR', 'ru-RU',
  'ja-JP', 'pa-IN', 'de-DE', 'jv-ID', 'ko-KR', 'fr-FR', 'te-IN', 'mr-IN',
  'tr-TR', 'ta-IN', 'vi-VN', 'it-IT', 'th-TH', 'pl-PL', 'uk-UA', 'ro-RO',
  'nl-NL', 'el-GR', 'cs-CZ', 'sv-SE', 'hu-HU', 'fi-FI', 'da-DK', 'no-NO',
  'he-IL', 'id-ID', 'ms-MY', 'fil-PH', 'fa-IR', 'sw-KE',
];

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>('en-US');
  const [translations, setTranslations] = useState<Translations>({});

  // Load translations for selected language
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
        } else {
          // Fallback to English
          const fallbackResponse = await fetch('/locales/en-US.json');
          const fallbackData = await fallbackResponse.json();
          setTranslations(fallbackData);
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslations();
  }, [language]);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language;
      const matchedLang = SUPPORTED_LANGUAGES.find(lang => 
        lang.toLowerCase().startsWith(browserLang.toLowerCase().split('-')[0])
      );
      if (matchedLang) {
        setLanguageState(matchedLang);
      }
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
      
      // Track language change
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'language_change', {
          event_category: 'Language',
          event_label: lang,
        });
      }
    }
  };

  // Translation function with nested key support (e.g., "common.buttons.submit")
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }

    return typeof value === 'string' ? value : (fallback || key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for simple translation
export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
