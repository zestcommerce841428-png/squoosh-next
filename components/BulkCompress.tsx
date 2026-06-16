'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Stack, Alert, Typography, Box, Slider, Button, MenuItem, TextField, LinearProgress } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, formatBytes } from '@/lib/imageTools';
import { useAuth } from '@/lib/supabase/AuthProvider';

interface Props { folderMode?: boolean; title: string; description: string; }

export default function BulkCompress({ folderMode, title, description }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp'>('image/jpeg');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ before: number; after: number } | null>(null);

  const pick = (list: FileList | null) => {
    if (!list) return;
    setFiles(Array.from(list).filter((f) => f.type.startsWith('image/')));
    setResult(null);
  };

  const run = async () => {
    if (loading) return;
    if (!user) { router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`); return; }
    if (files.length === 0) { setError('Add some images first.'); return; }
    setBusy(true); setError(null); setProgress(0);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const ext = format === 'image/webp' ? 'webp' : 'jpg';
      let before = 0, after = 0;
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        before += f.size;
        const img = await fileToImage(f);
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const blob = await canvasToBlob(canvas, format, quality / 100);
        after += blob.size;
        const name = f.name.replace(/\.[^.]+$/, '') + '.' + ext;
        zip.file(name, blob);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = 'compressed-images.zip';
      a.click();
      setResult({ before, after });
    } catch { setError('Compression failed.'); }
    finally { setBusy(false); }
  };

  const reset = () => { setFiles([]); setResult(null); setError(null); setProgress(0); };

  return (
    <ToolLayout
      title={title}
      description={description}
      features={['Batch Process', 'ZIP Download', 'JPEG / WebP', 'No Upload']}
    >
      <Stack spacing={3} sx={{ maxWidth: 720, mx: 'auto' }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Button variant="outlined" component="label" sx={{ py: 2, borderStyle: 'dashed' }}>
          {folderMode ? '+ Select a folder of images' : '+ Select images (multiple)'}
          <input
            hidden
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => pick(e.target.files)}
            {...((folderMode ? { webkitdirectory: '', directory: '' } : {}) as Record<string, string>)}
          />
        </Button>

        {files.length > 0 && (
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Typography variant="body2">{files.length} image{files.length > 1 ? 's' : ''} selected · {formatBytes(files.reduce((s, f) => s + f.size, 0))}</Typography>
              <TextField select label="Output format" value={format} onChange={(e) => setFormat(e.target.value as 'image/jpeg' | 'image/webp')} sx={{ maxWidth: 220 }}>
                <MenuItem value="image/jpeg">JPEG</MenuItem>
                <MenuItem value="image/webp">WebP</MenuItem>
              </TextField>
              <Box>
                <Typography variant="body2">Quality: {quality}%</Typography>
                <Slider value={quality} min={30} max={95} onChange={(_, v) => setQuality(v as number)} />
              </Box>
              {busy && <LinearProgress variant="determinate" value={progress} />}
              {result && (
                <Alert severity="success">
                  Done! {formatBytes(result.before)} → {formatBytes(result.after)} — saved {Math.round((1 - result.after / result.before) * 100)}%. ZIP downloaded.
                </Alert>
              )}
            </Stack>
          </Card>
        )}

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={reset} fullWidth disabled={busy}>Reset</Button>
          <Button variant="contained" onClick={run} disabled={busy || files.length === 0} fullWidth>
            {busy ? 'Compressing…' : 'Compress & download ZIP'}
          </Button>
        </Stack>
      </Stack>
    </ToolLayout>
  );
}
