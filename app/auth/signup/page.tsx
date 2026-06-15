'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Stack, TextField, Button, Alert, Divider, Box, Avatar, Typography, LinearProgress,
  InputAdornment, IconButton,
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { executeReCaptcha } from '@/lib/recaptcha';
import AuthShell, { GoogleIcon } from '@/components/AuthShell';

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pwScore = useMemo(() => strength(password), [password]);
  const pwLabel = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'][pwScore];
  const pwColor = (['error', 'error', 'warning', 'info', 'success'] as const)[pwScore];

  const onAvatar = (f: File | null) => {
    setAvatarFile(f);
    setAvatarPreview(f ? URL.createObjectURL(f) : null);
  };

  const signUp = async () => {
    setBusy(true); setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); setBusy(false); return; }
    try { await executeReCaptcha('signup'); } catch { /* optional in dev */ }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { first_name: firstName, last_name: lastName, display_name: `${firstName} ${lastName}`.trim() },
      },
    });
    if (error) { setError(error.message); setBusy(false); return; }

    const userId = data.user?.id;
    if (userId && data.session) {
      await supabase.from('profiles').update({ phone }).eq('id', userId);
      if (avatarFile) {
        const fd = new FormData();
        fd.append('file', avatarFile);
        await fetch('/api/profile/avatar', { method: 'POST', body: fd }).catch(() => {});
      }
    }

    setDone(true);
    setBusy(false);
    if (data.session) router.push('/profile');
  };

  const signUpGoogle = async () => {
    setError(null);
    try { await executeReCaptcha('signup_google'); } catch { /* optional */ }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/profile` },
    });
  };

  if (done) {
    return (
      <AuthShell title="Almost there!" subtitle="Verify your email to finish">
        <Stack spacing={2} alignItems="center">
          <Alert severity="success" sx={{ width: '100%' }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it, then sign in.
          </Alert>
          <Button component={Link} href="/auth/login" variant="contained" fullWidth sx={{ py: 1.25 }}>Go to sign in</Button>
        </Stack>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Squoosh Next — it only takes a minute"
      maxWidth={520}
      footer={<>Already have an account? <Link href="/auth/login">Sign in</Link></>}
    >
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}

        <Button variant="outlined" size="large" onClick={signUpGoogle} startIcon={<GoogleIcon />} sx={{ py: 1.25, textTransform: 'none', fontWeight: 600 }}>
          Sign up with Google
        </Button>
        <Divider sx={{ color: 'text.secondary', fontSize: 13 }}>or with email</Divider>

        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={avatarPreview || undefined} sx={{ width: 56, height: 56 }} />
          <Button variant="outlined" component="label" size="small" sx={{ textTransform: 'none' }}>
            {avatarFile ? 'Change photo' : 'Upload photo'}
            <input hidden type="file" accept="image/*" onChange={(e) => onAvatar(e.target.files?.[0] || null)} />
          </Button>
          <Typography variant="caption" color="text.secondary">Optional</Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="First name" fullWidth value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Last name" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </Stack>
        <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Box>
          <TextField
            label="Password"
            type={showPw ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            slotProps={{ input: { endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPw((s) => !s)} edge="end" size="small">{showPw ? '🙈' : '👁️'}</IconButton>
              </InputAdornment>
            ) } }}
          />
          {password && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress variant="determinate" value={(pwScore / 4) * 100} color={pwColor} sx={{ height: 6, borderRadius: 3 }} />
              <Typography variant="caption" color={`${pwColor}.main`}>{pwLabel}</Typography>
            </Box>
          )}
        </Box>
        <TextField label="Phone (optional)" type="tel" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />

        <Button variant="contained" size="large" onClick={signUp} disabled={busy || !email || !password} sx={{ py: 1.25, fontWeight: 700 }}>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          You can add address, social links and preferences later from your profile.
        </Typography>
      </Stack>
    </AuthShell>
  );
}
