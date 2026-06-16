'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Slider, MenuItem, TextField } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, replaceExt, formatBytes } from '@/lib/imageTools';

const FORMATS = [
  { v: 'image/jpeg', label: 'JPEG', ext: '.jpg' },
  { v: 'image/webp', label: 'WebP', ext: '.webp' },
  { v: 'image/png', label: 'PNG (lossless)', ext: '.png' },
];

export default function CustomQualityCompressionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(0); // 0 = keep

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setFile(f); setOriginalUrl(URL.createObjectURL(f)); setOutUrl(null); setError(null);
  };

  const apply = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const img = await fileToImage(file);
      let w = img.width, h = img.height;
      if (maxWidth > 0 && w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      if (format !== 'image/png') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      const blob = await canvasToBlob(canvas, format, format === 'image/png' ? undefined : quality / 100);
      setOutSize(blob.size);
      setOutUrl(URL.createObjectURL(blob));
    } catch { setError('Compression failed.'); }
    finally { setProcessing(false); }
  };

  const download = async () => {
    const r = await fetch(outUrl!);
    const ext = FORMATS.find((f) => f.v === format)?.ext || '.jpg';
    downloadBlob(await r.blob(), replaceExt(file!.name, '-compressed' + ext));
  };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); setOutSize(0); };

  const ratio = outSize && file ? Math.round((1 - outSize / file.size) * 100) : 0;

  return (
    <ToolLayout
      title="Custom Quality Compression"
      description="Fine-grained control over format, quality and max dimensions with a live size readout. Processed in your browser."
      features={['JPEG / WebP / PNG', 'Quality Slider', 'Optional Resize', 'Size Preview']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
            <img src={outUrl || originalUrl!} alt="preview" style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain' }} />
          </Box>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select label="Format" value={format} onChange={(e) => setFormat(e.target.value)} fullWidth>
                  {FORMATS.map((f) => <MenuItem key={f.v} value={f.v}>{f.label}</MenuItem>)}
                </TextField>
                <TextField type="number" label="Max width (0 = keep)" value={maxWidth} onChange={(e) => setMaxWidth(Math.max(0, Number(e.target.value)))} fullWidth />
              </Stack>
              {format !== 'image/png' && (
                <Box>
                  <Typography variant="body2">Quality: {quality}%</Typography>
                  <Slider value={quality} min={10} max={100} onChange={(_, v) => setQuality(v as number)} />
                </Box>
              )}
              {outUrl && <Alert severity="success">Output: <strong>{formatBytes(outSize)}</strong> — saved {ratio}% ({formatBytes(file.size)} original)</Alert>}
            </Stack>
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
