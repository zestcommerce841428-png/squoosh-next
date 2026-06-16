'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Stack, Alert, Typography, Box, TextField, Button } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';
import { useAuth } from '@/lib/supabase/AuthProvider';

interface Info { title: string | null; image: string | null; price: string | null; currency: string; url: string; }

interface Props { store: string; title: string; description: string; placeholder: string; }

export default function ProductChecker({ store, title, description, placeholder }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [url, setUrl] = useState('');
  const [info, setInfo] = useState<Info | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const check = async () => {
    if (loading) return;
    if (!user) { router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`); return; }
    setBusy(true); setError(null); setInfo(null);
    try {
      const res = await fetch('/api/product-info', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Could not fetch product.');
      else setInfo(data);
    } catch {
      setError('Network error.');
    } finally { setBusy(false); }
  };

  return (
    <ToolLayout
      title={title}
      description={description}
      features={['Live Price', 'Product Title', 'Image Preview', `${store} Links`]}
    >
      <Stack spacing={3} sx={{ maxWidth: 760, mx: 'auto' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth label={`${store} product URL`} placeholder={placeholder} value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && url && check()} />
            <Button variant="contained" onClick={check} disabled={busy || !url} sx={{ px: 4 }}>{busy ? 'Checking…' : 'Check'}</Button>
          </Stack>
        </Card>

        {info && (
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              {info.image && <Box component="img" src={info.image} alt="" sx={{ width: { xs: '100%', sm: 180 }, height: 180, objectFit: 'contain', bgcolor: 'action.hover', borderRadius: 1 }} />}
              <Stack spacing={1} sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{info.title || 'Untitled product'}</Typography>
                {info.price ? (
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>{info.currency} {info.price}</Typography>
                ) : (
                  <Typography color="text.secondary">Price not found on the page.</Typography>
                )}
                <Button href={info.url} target="_blank" rel="noopener noreferrer" variant="outlined" sx={{ alignSelf: 'flex-start', mt: 1 }}>Open on {store}</Button>
              </Stack>
            </Stack>
          </Card>
        )}

        <Alert severity="info">
          Big retailers often block automated requests from servers. If a check fails, the store is likely blocking bots or rendering prices with JavaScript — that&apos;s expected, not a bug.
        </Alert>
      </Stack>
    </ToolLayout>
  );
}
