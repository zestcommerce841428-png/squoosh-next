'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Card, Typography, Button, Stack, CircularProgress } from '@mui/material';
import { useAuth } from '@/lib/supabase/AuthProvider';

/**
 * Gates an interactive tool: the surrounding page still renders (SEO-friendly),
 * but the tool itself requires sign-in. Shows a polished prompt to logged-out users.
 */
export default function RequireAuth({ children, label = 'this tool' }: { children: ReactNode; label?: string }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (!user) {
    const next = encodeURIComponent(pathname || '/');
    return (
      <Card
        sx={{
          maxWidth: 480, mx: 'auto', p: { xs: 3, sm: 5 }, textAlign: 'center',
          border: '1px solid', borderColor: 'divider', borderRadius: 3,
        }}
      >
        <Box sx={{ fontSize: 44, mb: 1 }}>🔒</Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Sign in to continue</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Create a free account or sign in to use {label}. Your images are always processed privately in your browser.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button component={Link} href={`/auth/login?next=${next}`} variant="contained" size="large" sx={{ fontWeight: 700, px: 4 }}>
            Sign in
          </Button>
          <Button component={Link} href={`/auth/signup?next=${next}`} variant="outlined" size="large" sx={{ fontWeight: 700, px: 4 }}>
            Create account
          </Button>
        </Stack>
      </Card>
    );
  }

  return <>{children}</>;
}
