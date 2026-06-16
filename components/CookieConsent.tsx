'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Paper, Typography, Button, Stack, Slide } from '@mui/material';

type Consent = 'granted' | 'denied';

function applyConsent(value: Consent) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (typeof w.gtag === 'function') {
    w.gtag('consent', 'update', {
      ad_storage: value,
      analytics_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    });
  }
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent');
    if (stored === 'granted' || stored === 'denied') {
      applyConsent(stored);
    } else {
      setOpen(true);
    }
  }, []);

  const choose = (value: Consent) => {
    localStorage.setItem('cookie-consent', value);
    localStorage.setItem('cookie-consent-at', new Date().toISOString());
    applyConsent(value);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Slide direction="up" in={open}>
      <Box sx={{ position: 'fixed', bottom: { xs: 8, sm: 16 }, left: { xs: 8, sm: 16 }, right: { xs: 8, sm: 16 }, zIndex: 1400, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <Paper
          elevation={8}
          sx={{
            pointerEvents: 'auto', maxWidth: 760, width: '100%', p: { xs: 2, sm: 2.5 },
            borderRadius: 3, border: '1px solid', borderColor: 'divider',
            display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>🍪 We value your privacy</Typography>
            <Typography variant="body2" color="text.secondary">
              We use cookies for analytics to improve your experience. Your images are always processed locally and never uploaded. See our{' '}
              <Link href="/cookies">Cookie Policy</Link> and <Link href="/privacy">Privacy Policy</Link>.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'row' }} spacing={1.5} sx={{ flexShrink: 0 }}>
            <Button onClick={() => choose('denied')} color="inherit" variant="outlined" sx={{ fontWeight: 600, flex: { xs: 1, md: 'none' } }}>
              Reject
            </Button>
            <Button onClick={() => choose('granted')} variant="contained" sx={{ fontWeight: 700, flex: { xs: 1, md: 'none' } }}>
              Accept all
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Slide>
  );
}
