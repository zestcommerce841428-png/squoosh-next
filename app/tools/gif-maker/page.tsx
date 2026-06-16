'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Stack, Alert, Typography, Box, Slider, Button } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';
import { fileToImage, downloadBlob } from '@/lib/imageTools';
import { useAuth } from '@/lib/supabase/AuthProvider';

export default function GifMakerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [delay, setDelay] = useState(400);
  const [width, setWidth] = useState(480);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...imgs]);
    setPreviews((prev) => [...prev, ...imgs.map((f) => URL.createObjectURL(f))]);
    setOutUrl(null);
  };

  const create = async () => {
    if (loading) return;
    if (!user) { router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`); return; }
    if (files.length < 2) { setError('Add at least 2 images.'); return; }
    setProcessing(true); setError(null);
    try {
      const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
      const first = await fileToImage(files[0]);
      const w = width;
      const h = Math.round((first.height / first.width) * width);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      const gif = GIFEncoder();

      for (const f of files) {
        const img = await fileToImage(f);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
        const scale = Math.min(w / img.width, h / img.height);
        const dw = img.width * scale, dh = img.height * scale;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
        const { data } = ctx.getImageData(0, 0, w, h);
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);
        gif.writeFrame(index, w, h, { palette, delay });
      }
      gif.finish();
      const blob = new Blob([gif.bytes() as BlobPart], { type: 'image/gif' });
      setOutUrl(URL.createObjectURL(blob));
    } catch {
      setError('Failed to create GIF.');
    } finally { setProcessing(false); }
  };

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), 'animation.gif'); };
  const reset = () => { setFiles([]); setPreviews([]); setOutUrl(null); setError(null); };

  return (
    <ToolLayout
      title="GIF Maker"
      description="Turn a series of images into an animated GIF with adjustable speed and size. Encoded entirely in your browser."
      features={['Multi-Frame GIF', 'Adjustable Speed', 'Custom Width', 'No Upload']}
    >
      <Stack spacing={3} sx={{ maxWidth: 820, mx: 'auto' }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Button variant="outlined" component="label" sx={{ py: 2, borderStyle: 'dashed' }}>
          + Add images (select multiple)
          <input hidden type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
        </Button>

        {previews.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {previews.map((p, i) => (
              <Box key={i} sx={{ position: 'relative' }}>
                <img src={p} alt={`frame ${i + 1}`} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6 }} />
                <Box sx={{ position: 'absolute', top: 2, left: 2, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', px: 0.6, borderRadius: 1, fontSize: 11 }}>{i + 1}</Box>
              </Box>
            ))}
          </Box>
        )}

        {files.length > 0 && (
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2">Frame delay: {delay} ms ({(1000 / delay).toFixed(1)} fps)</Typography>
                <Slider value={delay} min={100} max={1500} step={50} onChange={(_, v) => setDelay(v as number)} />
              </Box>
              <Box>
                <Typography variant="body2">Width: {width}px</Typography>
                <Slider value={width} min={120} max={800} step={20} onChange={(_, v) => setWidth(v as number)} />
              </Box>
            </Stack>
          </Card>
        )}

        {outUrl && (
          <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 2 }}>
            <img src={outUrl} alt="GIF" style={{ maxWidth: '100%', maxHeight: 400 }} />
          </Box>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="outlined" onClick={reset} fullWidth disabled={processing}>Reset</Button>
          <Button variant="contained" onClick={create} disabled={processing || files.length < 2} fullWidth>
            {processing ? 'Encoding…' : 'Create GIF'}
          </Button>
          {outUrl && <Button variant="contained" color="success" onClick={download} fullWidth>Download GIF</Button>}
        </Stack>
      </Stack>
    </ToolLayout>
  );
}
