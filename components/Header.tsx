'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AppBar, Toolbar, Typography, Button, Container, Stack, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider,
} from '@mui/material';
import { useColorMode } from './ThemeRegistry';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from '../lib/supabase/AuthProvider';
import { useLanguage } from '../lib/i18n';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const NAV_LINKS: { href: string; key: 'nav.compress' | 'nav.features' | 'nav.about' | 'nav.contact' | null; fallback: string }[] = [
  { href: '/compress', key: 'nav.compress', fallback: 'Workspace' },
  { href: '/features', key: 'nav.features', fallback: 'Features' },
  { href: '/blog', key: null, fallback: 'Blog' },
  { href: '/about', key: 'nav.about', fallback: 'About' },
  { href: '/contact', key: 'nav.contact', fallback: 'Contact' },
];

export default function Header() {
  const { mode, toggleColorMode } = useColorMode();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const label = (l: typeof NAV_LINKS[number]) => (l.key ? t(l.key) : l.fallback);
  const accountHref = user ? '/profile' : '/auth/login';
  const accountLabel = user ? 'Profile' : 'Sign in';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: mode === 'dark' ? 'rgba(9, 13, 22, 0.8)' : 'rgba(248, 250, 252, 0.8)',
        backdropFilter: 'blur(8px)',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', gap: 1 }}>
          {/* Logo */}
          <Box component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box component="img" src="/icon.png" alt="Squoosh Next Logo" sx={{ width: 24, height: 24, borderRadius: '4px' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Squoosh Next
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Stack direction="row" spacing={{ xs: 1, md: 3 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
            {NAV_LINKS.map((l) => (
              <Button key={l.href} component={Link} href={l.href} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {label(l)}
              </Button>
            ))}
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1.5 }} alignItems="center">
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <LanguageSwitcher />
            </Box>
            <IconButton onClick={toggleColorMode} color="inherit" size="small" aria-label="Toggle color mode">
              {mode === 'light' ? <MoonIcon /> : <SunIcon />}
            </IconButton>
            <Button
              component={Link}
              href={accountHref}
              variant="outlined"
              color="inherit"
              size="small"
              sx={{ fontWeight: 700, display: { xs: 'none', md: 'inline-flex' } }}
            >
              {accountLabel}
            </Button>
            <Button
              component={Link}
              href="/compress"
              variant="contained"
              color="primary"
              size="small"
              sx={{ fontWeight: 700, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Start Compressing
            </Button>
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              sx={{ display: { xs: 'inline-flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setOpen(false)}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="img" src="/icon.png" alt="" sx={{ width: 24, height: 24, borderRadius: '4px' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Squoosh Next</Typography>
          </Box>
          <Divider />
          <List>
            {NAV_LINKS.map((l) => (
              <ListItem key={l.href} disablePadding>
                <ListItemButton component={Link} href={l.href}>
                  <ListItemText primary={label(l)} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 2 }}>
            <LanguageSwitcher />
            <Button component={Link} href={accountHref} variant="outlined" color="inherit" fullWidth sx={{ fontWeight: 700, mt: 2 }}>
              {accountLabel}
            </Button>
            <Button
              component={Link}
              href="/compress"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontWeight: 700, mt: 1.5 }}
            >
              Start Compressing
            </Button>
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
}
