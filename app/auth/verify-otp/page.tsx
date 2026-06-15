'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Stack, TextField, Button, Alert, Box, CircularProgress } from '@mui/material';
import AuthShell from '@/components/AuthShell';

function VerifyInner() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async () => {
    setBusy(true); setError(null);
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Verification failed.'); setBusy(false); return; }
    if (data.actionLink) window.location.href = data.actionLink;
  };

  return (
    <AuthShell
      title="Enter your code"
      subtitle={`We sent a 6-digit code to ${email}`}
      footer={<Link href="/auth/login">Use a different method</Link>}
    >
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && code.length === 6 && verify()}
          inputProps={{ inputMode: 'numeric', style: { letterSpacing: 10, textAlign: 'center', fontSize: 26, fontWeight: 700 } }}
          fullWidth
          autoFocus
        />
        <Button variant="contained" size="large" onClick={verify} disabled={busy || code.length !== 6} sx={{ py: 1.25, fontWeight: 700 }}>
          {busy ? 'Verifying…' : 'Verify & sign in'}
        </Button>
      </Stack>
    </AuthShell>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>}>
      <VerifyInner />
    </Suspense>
  );
}
