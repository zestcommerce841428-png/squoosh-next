'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Container, Card, Stack, TextField, Button, Typography, Alert, Divider, Box, Avatar,
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import { executeReCaptcha } from '@/lib/recaptcha';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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

    // Persist extra profile fields + upload avatar to Hostinger if a session is active.
    const userId = data.user?.id;
    if (userId && data.session) {
      await supabase.from('profiles').update({ phone, company }).eq('id', userId);
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

  if (done) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Almost there!</Typography>
          <Alert severity="success">Check your inbox to confirm your email, then sign in.</Alert>
          <Button component={Link} href="/auth/login" sx={{ mt: 3 }} variant="contained">Go to sign in</Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Card sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={2.5}>
          <Box textAlign="center">
            <Typography variant="h4" sx={{ fontWeight: 800 }}>Create your account</Typography>
            <Typography color="text.secondary">Join Squoosh Next</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={avatarPreview || undefined} sx={{ width: 64, height: 64 }} />
            <Button variant="outlined" component="label">
              {avatarFile ? 'Change photo' : 'Upload profile photo'}
              <input hidden type="file" accept="image/*" onChange={(e) => onAvatar(e.target.files?.[0] || null)} />
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="First name" fullWidth value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <TextField label="Last name" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Stack>
          <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} helperText="Min 8 characters" autoComplete="new-password" />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Phone (optional)" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
            <TextField label="Company (optional)" fullWidth value={company} onChange={(e) => setCompany(e.target.value)} />
          </Stack>

          <Button variant="contained" size="large" onClick={signUp} disabled={busy || !email || !password} fullWidth>
            {busy ? 'Creating account…' : 'Create account'}
          </Button>

          <Divider />
          <Typography variant="body2" textAlign="center" color="text.secondary">
            You can complete the remaining profile details (address, social links, preferences) any time from your profile page.
          </Typography>
          <Typography variant="body2" textAlign="center">
            Already have an account? <Link href="/auth/login">Sign in</Link>
          </Typography>
        </Stack>
      </Card>
    </Container>
  );
}
