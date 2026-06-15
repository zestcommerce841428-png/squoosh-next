'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Stack, TextField, Button, Alert } from '@mui/material';
import { createClient } from '@/lib/supabase/client';
import AuthShell from '@/components/AuthShell';

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
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure reset link"
      footer={<Link href="/auth/login">Back to sign in</Link>}
    >
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}
        {sent ? (
          <Alert severity="success">If an account exists for <strong>{email}</strong>, a reset link is on its way.</Alert>
        ) : (
          <>
            <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && email && submit()} />
            <Button variant="contained" size="large" onClick={submit} disabled={busy || !email} sx={{ py: 1.25, fontWeight: 700 }}>
              {busy ? 'Sending…' : 'Send reset link'}
            </Button>
          </>
        )}
      </Stack>
    </AuthShell>
  );
}
