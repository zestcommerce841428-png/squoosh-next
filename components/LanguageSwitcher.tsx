'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip,
} from '@mui/material';

// Language/Country Configuration
interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

const LANGUAGES: Language[] = [
  // Americas
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸', region: 'Americas' },
  { code: 'en-CA', name: 'English (Canada)', nativeName: 'English', flag: '🇨🇦', region: 'Americas' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', flag: '🇪🇸', region: 'Europe' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español', flag: '🇲🇽', region: 'Americas' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', flag: '🇧🇷', region: 'Americas' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português', flag: '🇵🇹', region: 'Europe' },
  
  // Europe
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧', region: 'Europe' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'Europe' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Europe' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Europe' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Europe' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Europe' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Europe' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Europe' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', region: 'Europe' },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', region: 'Europe' },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', region: 'Europe' },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', region: 'Europe' },
  
  // Asia-Pacific
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', region: 'Asia' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', region: 'Asia' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Asia' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'Asia' },
  { code: 'hi-IN', name: 'Hindi (India)', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'Asia' },
  { code: 'bn-BD', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', region: 'Asia' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'Asia' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Asia' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Asia' },
  { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', region: 'Asia' },
  { code: 'fil-PH', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', region: 'Asia' },
  
  // Middle East & Africa
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East' },
  { code: 'ar-EG', name: 'Arabic (Egypt)', nativeName: 'العربية', flag: '🇪🇬', region: 'Middle East' },
  { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', region: 'Middle East' },
  { code: 'fa-IR', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', region: 'Middle East' },
  { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', region: 'Asia' },
  { code: 'sw-KE', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', region: 'Africa' },
  
  // Oceania
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English', flag: '🇦🇺', region: 'Oceania' },
  { code: 'en-NZ', name: 'English (New Zealand)', nativeName: 'English', flag: '🇳🇿', region: 'Oceania' },
];

// Globe icon SVG
const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default function LanguageSwitcher() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentLang, setCurrentLang] = useState<Language>(LANGUAGES[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved language from localStorage
    const savedLangCode = localStorage.getItem('squoosh-language');
    if (savedLangCode) {
      const lang = LANGUAGES.find(l => l.code === savedLangCode);
      if (lang) {
        setCurrentLang(lang);
        document.documentElement.lang = lang.code.split('-')[0];
      }
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language || 'en-US';
      const matchedLang = LANGUAGES.find(l => l.code === browserLang) || 
                          LANGUAGES.find(l => l.code.startsWith(browserLang.split('-')[0])) ||
                          LANGUAGES[0];
      setCurrentLang(matchedLang);
      document.documentElement.lang = matchedLang.code.split('-')[0];
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('squoosh-language', lang.code);
    document.documentElement.lang = lang.code.split('-')[0];
    
    // Trigger Google Analytics language change event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'language_change', {
        language: lang.code,
        language_name: lang.name,
      });
    }
    
    handleClose();
    
    // Optional: Reload page to apply language changes
    // window.location.reload();
  };

  // Group languages by region
  const groupedLanguages = LANGUAGES.reduce((acc, lang) => {
    if (!acc[lang.region]) acc[lang.region] = [];
    acc[lang.region].push(lang);
    return acc;
  }, {} as Record<string, Language[]>);

  const regions = ['Americas', 'Europe', 'Asia', 'Middle East', 'Africa', 'Oceania'];

  if (!mounted) return null;

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={handleClick}
        startIcon={<GlobeIcon />}
        sx={{
          minWidth: 140,
          textTransform: 'none',
          fontWeight: 600,
          borderColor: 'divider',
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography component="span" sx={{ fontSize: '1.2rem' }}>
            {currentLang.flag}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {currentLang.code.split('-')[0].toUpperCase()}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 500,
            width: 320,
            mt: 1,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            Select Language / Region
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Choose your preferred language and region
          </Typography>
        </Box>

        {regions.map((region) => {
          const langs = groupedLanguages[region];
          if (!langs || langs.length === 0) return null;
          
          return (
            <Box key={region}>
              <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
                  {region}
                </Typography>
              </Box>
              {langs.map((lang) => (
                <MenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang)}
                  selected={currentLang.code === lang.code}
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon sx={{ fontSize: '1.5rem', minWidth: 36 }}>
                    {lang.flag}
                  </ListItemIcon>
                  <ListItemText
                    primary={lang.name}
                    secondary={lang.nativeName}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  {currentLang.code === lang.code && (
                    <Chip label="Active" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                  )}
                </MenuItem>
              ))}
            </Box>
          );
        })}

        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            <strong>Current Selection:</strong>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '1.5rem' }}>{currentLang.flag}</Typography>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentLang.name}</Typography>
              <Typography variant="caption" color="text.secondary">{currentLang.nativeName}</Typography>
            </Box>
          </Box>
        </Box>
      </Menu>
    </Box>
  );
}
