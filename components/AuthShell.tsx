'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Box, Card, Container, Stack, Typography } from '@mui/material';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);

export { GoogleIcon };

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
}

export default function AuthShell({ title, subtitle, children, footer, maxWidth = 460 }: AuthShellProps) {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 4, md: 6 },
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'radial-gradient(1200px 600px at 50% -10%, rgba(99,102,241,0.18), transparent 60%)'
            : 'radial-gradient(1200px 600px at 50% -10%, rgba(99,102,241,0.12), transparent 60%)',
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ maxWidth }}>
        <Card
          elevation={0}
          sx={{
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          }}
        >
          <Box sx={{ height: 6, background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)' }} />
          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
              <Box
                component={Link}
                href="/"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit', mb: 1 }}
              >
                <Box component="img" src="/icon.png" alt="" sx={{ width: 32, height: 32, borderRadius: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Squoosh Next</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center' }}>{title}</Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {subtitle}
                </Typography>
              )}
            </Stack>

            {children}
          </Box>
        </Card>

        {footer && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            {footer}
          </Typography>
        )}
      </Container>
    </Box>
  );
}
