'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, TextField, Slider } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob } from '@/lib/imageTools';

function drawMemeText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, fontSize: number, baseline: CanvasTextBaseline) {
  ctx.font = `bold ${fontSize}px Impact, "Arial Black", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = baseline;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = Math.max(2, fontSize / 12);
  ctx.lineJoin = 'round';
  const up = text.toUpperCase();
  ctx.strokeText(up, x, y);
  ctx.fillText(up, x, y);
}

export default function MemeGeneratorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [top, setTop] = useState('Top Text');
  const [bottom, setBottom] = useState('Bottom Text');
  const [scale, setScale] = useState(8);

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setFile(f); setOriginalUrl(URL.createObjectURL(f)); setOutUrl(null); setError(null);
  };

  const apply = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const img = await fileToImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const fontSize = (scale / 100) * img.width;
      const pad = fontSize * 0.3;
      if (top.trim()) drawMemeText(ctx, top, img.width / 2, pad, fontSize, 'top');
      if (bottom.trim()) drawMemeText(ctx, bottom, img.width / 2, img.height - pad, fontSize, 'bottom');
      const blob = await canvasToBlob(canvas, 'image/png');
      setOutUrl(URL.createObjectURL(blob));
    } catch { setError('Failed to generate meme.'); }
    finally { setProcessing(false); }
  };

  const download = async () => {
    const res = await fetch(outUrl!);
    downloadBlob(await res.blob(), 'meme.png');
  };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); };

  return (
    <ToolLayout
      title="Meme Generator"
      description="Add classic top and bottom Impact-style captions to any image. 100% client-side."
      features={['Top & Bottom Text', 'Impact Font', 'Adjustable Size', 'PNG Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
            <img src={outUrl || originalUrl!} alt="preview" style={{ maxWidth: '100%', maxHeight: 460, objectFit: 'contain' }} />
          </Box>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <TextField label="Top Text" fullWidth value={top} onChange={(e) => setTop(e.target.value)} />
              <TextField label="Bottom Text" fullWidth value={bottom} onChange={(e) => setBottom(e.target.value)} />
              <Box>
                <Typography variant="body2">Text Size: {scale}%</Typography>
                <Slider value={scale} min={3} max={18} onChange={(_, v) => setScale(v as number)} />
              </Box>
            </Stack>
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
