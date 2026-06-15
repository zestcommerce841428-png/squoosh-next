'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container, Card, Stack, TextField, Button, Typography, Alert, Divider, Box, CircularProgress,
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { executeReCaptcha } from '@/lib/recaptcha';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/profile';
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const guard = async (action: string) => {
    try { await executeReCaptcha(action); } catch { /* reCAPTCHA optional in dev */ }
  };

  const signInPassword = async () => {
    setBusy(true); setError(null); setInfo(null);
    await guard('login');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push(next);
    setBusy(false);
  };

  const signInGoogle = async () => {
    setError(null);
    await guard('login_google');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  };

  const sendEmailOtp = async () => {
    if (!email) { setError('Enter your email first.'); return; }
    setBusy(true); setError(null); setInfo(null);
    await guard('login_otp');
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Could not send code.');
    else { setInfo('We emailed you a 6-digit login code.'); router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`); }
    setBusy(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Card sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <Box textAlign="center">
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Welcome back</Typography>
            <Typography color="text.secondary">Sign in to your account</Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
          {info && <Alert severity="success">{info}</Alert>}

          <Button variant="outlined" size="large" onClick={signInGoogle} fullWidth>
            Continue with Google
          </Button>

          <Divider>or</Divider>

          <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

          <Button variant="contained" size="large" onClick={signInPassword} disabled={busy || !email || !password} fullWidth>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
          <Button variant="text" onClick={sendEmailOtp} disabled={busy} fullWidth>
            Email me a one-time login code instead
          </Button>

          <Stack direction="row" justifyContent="space-between">
            <Link href="/auth/forgot-password" style={{ fontSize: 14 }}>Forgot password?</Link>
            <Link href="/auth/signup" style={{ fontSize: 14 }}>Create an account</Link>
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>}>
      <LoginInner />
    </Suspense>
  );
}
