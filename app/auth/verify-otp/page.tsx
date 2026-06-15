'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Container, Card, Stack, TextField, Button, Typography, Alert, Box, CircularProgress } from '@mui/material';

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
    <Container maxWidth="xs" sx={{ py: { xs: 4, md: 8 } }}>
      <Card sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <Box textAlign="center">
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Enter your code</Typography>
            <Typography color="text.secondary" variant="body2">Sent to {email}</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{ inputMode: 'numeric', style: { letterSpacing: 8, textAlign: 'center', fontSize: 24 } }}
            fullWidth
          />
          <Button variant="contained" size="large" onClick={verify} disabled={busy || code.length !== 6} fullWidth>
            {busy ? 'Verifying…' : 'Verify & sign in'}
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>}>
      <VerifyInner />
    </Suspense>
  );
}
