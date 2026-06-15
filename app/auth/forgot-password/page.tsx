'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container, Card, Stack, TextField, Button, Typography, Alert, Box } from '@mui/material';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true); setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setBusy(false);
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 4, md: 8 } }}>
      <Card sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <Box textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Reset password</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          {sent ? (
            <Alert severity="success">If an account exists for {email}, a reset link is on its way.</Alert>
          ) : (
            <>
              <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button variant="contained" size="large" onClick={submit} disabled={busy || !email} fullWidth>
                {busy ? 'Sending…' : 'Send reset link'}
              </Button>
            </>
          )}
          <Typography variant="body2" textAlign="center"><Link href="/auth/login">Back to sign in</Link></Typography>
        </Stack>
      </Card>
    </Container>
  );
}
