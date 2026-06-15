'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TranslationKeys {
  // Common
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.upload': string;
  'common.download': string;
  'common.reset': string;
  'common.process': string;
  'common.compress': string;
  'common.convert': string;
  'common.resize': string;
  'common.quality': string;
  'common.fileSize': string;
  'common.original': string;
  'common.processed': string;
  'common.saved': string;
  
  // Navigation
  'nav.home': string;
  'nav.features': string;
  'nav.tools': string;
  'nav.compress': string;
  'nav.about': string;
  'nav.contact': string;
  
  // Features
  'features.title': string;
  'features.subtitle': string;
  'features.toolsLive': string;
  'features.comingSoon': string;
  'features.noDemo': string;
  'features.clientSide': string;
  
  // Tools
  'tools.compression': string;
  'tools.optimization': string;
  'tools.editing': string;
  'tools.aiFeatures': string;
}

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'hi' | 'ar' | 'pt';

const RTL_LANGS: Language[] = ['ar'];

interface LanguageContextType {
  language: Language;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations: Record<Language, Partial<TranslationKeys>> = {
  en: {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.upload': 'Upload Image',
    'common.download': 'Download',
    'common.reset': 'Reset',
    'common.process': 'Process',
    'common.compress': 'Compress',
    'common.convert': 'Convert',
    'common.resize': 'Resize',
    'common.quality': 'Quality',
    'common.fileSize': 'File Size',
    'common.original': 'Original',
    'common.processed': 'Processed',
    'common.saved': 'Saved',
    
    'nav.home': 'Home',
    'nav.features': 'Features',
    'nav.tools': 'Tools',
    'nav.compress': 'Compress',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    'features.title': 'Professional Image Tools Suite',
    'features.subtitle': 'fully functional tools are live now with advanced features coming soon',
    'features.toolsLive': 'Tools Live Now',
    'features.comingSoon': 'Coming Soon',
    'features.noDemo': 'No Demo - All Functional',
    'features.clientSide': '100% Client-Side & Secure',
    
    'tools.compression': 'Compression',
    'tools.optimization': 'Optimization',
    'tools.editing': 'Editing',
    'tools.aiFeatures': 'AI Features',
  },
  es: {
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.upload': 'Subir imagen',
    'common.download': 'Descargar',
    'common.reset': 'Reiniciar',
    'common.process': 'Procesar',
    'common.compress': 'Comprimir',
    'common.convert': 'Convertir',
    'common.resize': 'Redimensionar',
    'common.quality': 'Calidad',
    'common.fileSize': 'Tamaño del archivo',
    'common.original': 'Original',
    'common.processed': 'Procesado',
    'common.saved': 'Guardado',
    
    'nav.home': 'Inicio',
    'nav.features': 'Características',
    'nav.tools': 'Herramientas',
    'nav.compress': 'Comprimir',
    'nav.about': 'Acerca de',
    'nav.contact': 'Contacto',
    
    'features.title': 'Suite Profesional de Herramientas de Imagen',
    'features.subtitle': 'herramientas completamente funcionales están en vivo ahora con funciones avanzadas próximamente',
    'features.toolsLive': 'Herramientas en Vivo Ahora',
    'features.comingSoon': 'Próximamente',
    'features.noDemo': 'Sin Demo - Todo Funcional',
    'features.clientSide': '100% del Lado del Cliente y Seguro',
  },
  fr: {
    'common.loading': 'Chargement...',
    'common.upload': 'Télécharger l\'image',
    'common.download': 'Télécharger',
    'common.compress': 'Compresser',
    'nav.home': 'Accueil',
    'nav.features': 'Fonctionnalités',
    'nav.tools': 'Outils',
    'nav.compress': 'Compresser',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
  },
  de: {
    'common.loading': 'Laden...',
    'common.upload': 'Bild hochladen',
    'common.download': 'Herunterladen',
    'common.compress': 'Komprimieren',
    'nav.home': 'Startseite',
    'nav.features': 'Funktionen',
    'nav.tools': 'Werkzeuge',
    'nav.compress': 'Komprimieren',
    'nav.about': 'Über uns',
    'nav.contact': 'Kontakt',
  },
  zh: {
    'common.loading': '加载中...',
    'common.upload': '上传图片',
    'common.download': '下载',
    'common.compress': '压缩',
    'nav.home': '首页',
    'nav.features': '功能',
    'nav.tools': '工具',
    'nav.compress': '压缩',
    'nav.about': '关于',
    'nav.contact': '联系',
  },
  ja: {
    'common.loading': '読み込み中...',
    'common.upload': '画像をアップロード',
    'common.download': 'ダウンロード',
    'common.compress': '圧縮',
    'nav.home': 'ホーム',
    'nav.features': '機能',
    'nav.tools': 'ツール',
    'nav.compress': '圧縮',
    'nav.about': '会社概要',
    'nav.contact': 'お問い合わせ',
  },
  ko: {
    'common.loading': '로딩 중...',
    'common.upload': '이미지 업로드',
    'common.download': '다운로드',
    'common.compress': '압축',
    'nav.home': '홈',
    'nav.features': '기능',
    'nav.tools': '도구',
    'nav.compress': '압축',
    'nav.about': '소개',
    'nav.contact': '문의',
  },
  hi: {
    'common.loading': 'लोड हो रहा है...',
    'common.upload': 'छवि अपलोड करें',
    'common.download': 'डाउनलोड',
    'common.compress': 'संपीड़ित करें',
    'nav.home': 'होम',
    'nav.features': 'विशेषताएँ',
    'nav.tools': 'उपकरण',
    'nav.compress': 'कंप्रेस',
    'nav.about': 'हमारे बारे में',
    'nav.contact': 'संपर्क करें',
  },
  ar: {
    'common.loading': 'جاري التحميل...',
    'common.upload': 'تحميل الصورة',
    'common.download': 'تحميل',
    'common.compress': 'ضغط',
    'nav.home': 'الرئيسية',
    'nav.features': 'الميزات',
    'nav.tools': 'الأدوات',
    'nav.compress': 'ضغط',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
  },
  pt: {
    'common.loading': 'Carregando...',
    'common.upload': 'Carregar imagem',
    'common.download': 'Baixar',
    'common.compress': 'Comprimir',
    'nav.home': 'Início',
    'nav.features': 'Recursos',
    'nav.tools': 'Ferramentas',
    'nav.compress': 'Comprimir',
    'nav.about': 'Sobre',
    'nav.contact': 'Contato',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  const applyDir = (lang: Language) => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    // Load saved language; tolerate old locale-style values like "en-US".
    const saved = localStorage.getItem('squoosh-language');
    const savedBase = saved ? (saved.split('-')[0] as Language) : null;
    if (savedBase && savedBase in translations) {
      setLanguageState(savedBase);
      applyDir(savedBase);
    } else {
      const browserLang = navigator.language.split('-')[0] as Language;
      if (browserLang in translations) {
        setLanguageState(browserLang);
        applyDir(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('squoosh-language', lang);
    applyDir(lang);
  };

  const dir: 'ltr' | 'rtl' = RTL_LANGS.includes(language) ? 'rtl' : 'ltr';

  const t = (key: keyof TranslationKeys): string => {
    const langTranslations = translations[language];
    return langTranslations[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
