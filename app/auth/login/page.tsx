'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Stack, TextField, Button, Alert, Divider, Box, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { executeReCaptcha } from '@/lib/recaptcha';
import AuthShell, { GoogleIcon } from '@/components/AuthShell';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/profile';
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const guard = async (action: string) => {
    try { await executeReCaptcha(action); } catch { /* optional in dev */ }
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
    else { setInfo('Login code sent.'); router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`); }
    setBusy(false);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your tools and profile"
      footer={<>Don&apos;t have an account? <Link href="/auth/signup">Create one</Link></>}
    >
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}
        {info && <Alert severity="success">{info}</Alert>}

        <Button variant="outlined" size="large" onClick={signInGoogle} startIcon={<GoogleIcon />} sx={{ py: 1.25, textTransform: 'none', fontWeight: 600 }}>
          Continue with Google
        </Button>

        <Divider sx={{ color: 'text.secondary', fontSize: 13 }}>or sign in with email</Divider>

        <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <TextField
          label="Password"
          type={showPw ? 'text' : 'password'}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          onKeyDown={(e) => e.key === 'Enter' && email && password && signInPassword()}
          slotProps={{ input: { endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPw((s) => !s)} edge="end" size="small">{showPw ? '🙈' : '👁️'}</IconButton>
            </InputAdornment>
          ) } }}
        />

        <Box sx={{ textAlign: 'right', mt: -1 }}>
          <Link href="/auth/forgot-password" style={{ fontSize: 13 }}>Forgot password?</Link>
        </Box>

        <Button variant="contained" size="large" onClick={signInPassword} disabled={busy || !email || !password} sx={{ py: 1.25, fontWeight: 700 }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
        <Button variant="text" onClick={sendEmailOtp} disabled={busy} sx={{ textTransform: 'none' }}>
          Email me a one-time login code instead
        </Button>
      </Stack>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>}>
      <LoginInner />
    </Suspense>
  );
}
