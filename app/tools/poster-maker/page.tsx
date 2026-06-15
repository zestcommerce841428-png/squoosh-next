'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, TextField, Slider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, drawWrappedText } from '@/lib/imageTools';

type VPos = 'top' | 'center' | 'bottom';

export default function PosterMakerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('YOUR HEADLINE');
  const [subtitle, setSubtitle] = useState('Supporting subtitle goes here');
  const [vpos, setVpos] = useState<VPos>('bottom');
  const [overlay, setOverlay] = useState(45);

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
      ctx.fillStyle = `rgba(0,0,0,${overlay / 100})`;
      ctx.fillRect(0, 0, img.width, img.height);

      const titleSize = img.width * 0.08;
      const subSize = img.width * 0.035;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lh = titleSize * 1.15;
      // measure title lines
      ctx.font = `800 ${titleSize}px Arial, sans-serif`;
      const words = title.split(/\s+/); let lines = 1, cur = '';
      for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (ctx.measureText(t).width > img.width * 0.85 && cur) { lines++; cur = wd; } else cur = t; }
      const blockH = lines * lh + (subtitle.trim() ? subSize * 2 : 0);
      let cy: number;
      if (vpos === 'top') cy = img.height * 0.12 + lh / 2;
      else if (vpos === 'center') cy = img.height / 2 - blockH / 2 + lh / 2;
      else cy = img.height * 0.88 - blockH + lh / 2;

      const used = drawWrappedText(ctx, title, img.width / 2, cy, img.width * 0.85, lh);
      if (subtitle.trim()) {
        ctx.font = `500 ${subSize}px Arial, sans-serif`;
        drawWrappedText(ctx, subtitle, img.width / 2, cy + used + subSize * 0.4, img.width * 0.8, subSize * 1.3);
      }
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
      setOutUrl(URL.createObjectURL(blob));
    } catch { setError('Failed to create poster.'); }
    finally { setProcessing(false); }
  };

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), 'poster.jpg'); };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); };

  return (
    <ToolLayout
      title="Poster Maker"
      description="Turn a photo into a poster with a bold headline and subtitle over a darkened overlay. Made in your browser."
      features={['Headline + Subtitle', 'Text Position', 'Overlay Control', 'JPG Export']}
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
              <TextField label="Headline" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
              <TextField label="Subtitle" fullWidth value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              <FormControl fullWidth>
                <InputLabel>Text Position</InputLabel>
                <Select value={vpos} label="Text Position" onChange={(e) => setVpos(e.target.value as VPos)}>
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                </Select>
              </FormControl>
              <Box>
                <Typography variant="body2">Dark Overlay: {overlay}%</Typography>
                <Slider value={overlay} min={0} max={80} onChange={(_, v) => setOverlay(v as number)} />
              </Box>
            </Stack>
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
