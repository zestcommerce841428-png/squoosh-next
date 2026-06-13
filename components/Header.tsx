'use client';

import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Container, Stack, Box, IconButton } from '@mui/material';
import { useColorMode } from './ThemeRegistry';
import LanguageSwitcher from './LanguageSwitcher';

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

export default function Header() {
  const { mode, toggleColorMode } = useColorMode();

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        background: mode === 'dark' ? 'rgba(9, 13, 22, 0.8)' : 'rgba(248, 250, 252, 0.8)',
        backdropFilter: 'blur(8px)',
        color: 'text.primary'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box component="img" src="/icon.png" alt="Squoosh Next Logo" sx={{ width: 24, height: 24, borderRadius: "4px" }} />
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              Squoosh Next
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Stack direction="row" spacing={{ xs: 1, md: 3 }} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button component={Link} href="/compress" sx={{ color: 'text.secondary', fontWeight: 600 }}>Workspace</Button>
            <Button component={Link} href="/features" sx={{ color: 'text.secondary', fontWeight: 600 }}>Features</Button>
            <Button component={Link} href="/blog" sx={{ color: 'text.secondary', fontWeight: 600 }}>Blog</Button>
            <Button component={Link} href="/about" sx={{ color: 'text.secondary', fontWeight: 600 }}>About</Button>
            <Button component={Link} href="/contact" sx={{ color: 'text.secondary', fontWeight: 600 }}>Contact</Button>
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <LanguageSwitcher />
            <IconButton onClick={toggleColorMode} color="inherit" size="small">
              {mode === 'light' ? <MoonIcon /> : <SunIcon />}
            </IconButton>
            <Button
              component={Link}
              href="/compress"
              variant="contained"
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            >
              Start Compressing
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
