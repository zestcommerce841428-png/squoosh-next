'use client';

import { useState } from 'react';
import {
  Box, Button, Menu, MenuItem, ListItemText, Typography, Chip, useMediaQuery, useTheme,
} from '@mui/material';
import { useLanguage, type Language } from '../lib/i18n';

interface LangOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

// Only languages the app actually translates are offered, so every choice works.
const LANGUAGES: LangOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const choose = (lang: LangOption) => {
    setLanguage(lang.code);
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag) {
      (window as unknown as { gtag: (...a: unknown[]) => void }).gtag('event', 'language_change', { language: lang.code });
    }
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        variant="outlined"
        color="inherit"
        startIcon={!compact ? <GlobeIcon /> : undefined}
        aria-label="Change language"
        sx={{
          minWidth: compact ? 44 : 100,
          px: compact ? 1 : 1.5,
          textTransform: 'none',
          fontWeight: 600,
          borderColor: 'divider',
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        <Box component="span" sx={{ fontSize: '1.15rem', mr: compact ? 0 : 0.5 }}>{current.flag}</Box>
        {!compact && <Typography variant="body2" sx={{ fontWeight: 700 }}>{current.code.toUpperCase()}</Typography>}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { maxHeight: 420, width: 260, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Select language</Typography>
        </Box>
        {LANGUAGES.map((lang) => (
          <MenuItem key={lang.code} selected={language === lang.code} onClick={() => choose(lang)} sx={{ py: 1.25, gap: 1.5 }}>
            <Box component="span" sx={{ fontSize: '1.4rem', width: 28, textAlign: 'center' }}>{lang.flag}</Box>
            <ListItemText
              primary={lang.name}
              secondary={lang.nativeName}
              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
            {language === lang.code && <Chip label="Active" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
