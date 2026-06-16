'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, TextField, MenuItem, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

const TTLS = [
  { label: '1 hour', v: 3600 },
  { label: '6 hours', v: 21600 },
  { label: '24 hours', v: 86400 },
  { label: '7 days', v: 604800 },
  { label: '30 days', v: 2592000 },
];

export default function AutoExpiryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ttl, setTtl] = useState(86400);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setFile(f); setPreview(URL.createObjectURL(f)); setLink(null); setError(null);
  };

  const create = async () => {
    if (!file) return;
    setBusy(true); setError(null);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('ttl', String(ttl));
    const res = await fetch('/api/expiry/create', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) setError(data.error || 'Failed to create link.');
    else setLink(data.url);
    setBusy(false);
  };

  const copy = () => { if (link) { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } };
  const reset = () => { setFile(null); setPreview(null); setLink(null); setError(null); };

  return (
    <ToolLayout
      title="Auto-Expiry Image Link"
      description="Upload an image and get a share link that permanently self-destructs after the time you choose. The file is deleted server-side once it expires."
      features={['Self-Destructing', 'Choose Lifetime', 'Server-Enforced', 'Shareable Link']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3} sx={{ maxWidth: 680, mx: 'auto' }}>
          {preview && (
            <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
              <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain' }} />
            </Box>
          )}
          {!link ? (
            <Card sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <TextField select label="Expires after" value={ttl} onChange={(e) => setTtl(Number(e.target.value))} sx={{ maxWidth: 240 }}>
                  {TTLS.map((t) => <MenuItem key={t.v} value={t.v}>{t.label}</MenuItem>)}
                </TextField>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button variant="outlined" onClick={reset} fullWidth disabled={busy}>Reset</Button>
                  <Button variant="contained" onClick={create} disabled={busy} fullWidth>{busy ? 'Creating…' : 'Create expiring link'}</Button>
                </Stack>
              </Stack>
            </Card>
          ) : (
            <Card sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                <Alert severity="success">Your self-destructing link is ready. It stops working after {TTLS.find((t) => t.v === ttl)?.label}.</Alert>
                <TextField value={link} fullWidth InputProps={{ readOnly: true }} />
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={copy} fullWidth>{copied ? 'Copied!' : 'Copy link'}</Button>
                  <Button variant="outlined" href={link} target="_blank" rel="noopener noreferrer" fullWidth>Open</Button>
                </Stack>
                <Button onClick={reset}>Create another</Button>
              </Stack>
            </Card>
          )}
        </Stack>
      )}
    </ToolLayout>
  );
}
