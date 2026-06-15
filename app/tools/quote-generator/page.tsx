'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, TextField, Slider, Button } from '@mui/material';
import { ToolLayout, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, drawWrappedText } from '@/lib/imageTools';

const W = 1080, H = 1080;

export default function QuoteGeneratorPage() {
  const [quote, setQuote] = useState('The best way to predict the future is to create it.');
  const [author, setAuthor] = useState('Peter Drucker');
  const [bgImg, setBgImg] = useState<File | null>(null);
  const [bg1, setBg1] = useState('#6366f1');
  const [bg2, setBg2] = useState('#3b82f6');
  const [overlay, setOverlay] = useState(40);
  const [fontSize, setFontSize] = useState(60);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const render = async () => {
    setProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      if (bgImg) {
        const img = await fileToImage(bgImg);
        const scale = Math.max(W / img.width, H / img.height);
        const dw = img.width * scale, dh = img.height * scale;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        ctx.fillStyle = `rgba(0,0,0,${overlay / 100})`;
        ctx.fillRect(0, 0, W, H);
      } else {
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, bg1); grad.addColorStop(1, bg2);
        ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      }
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `italic 700 ${fontSize}px Georgia, serif`;
      const lh = fontSize * 1.3;
      // count lines for centering
      const words = ('“' + quote + '”').split(/\s+/);
      let lines = 1, cur = '';
      for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (ctx.measureText(t).width > W * 0.8 && cur) { lines++; cur = wd; } else cur = t; }
      const startY = H / 2 - ((lines - 1) * lh) / 2;
      const used = drawWrappedText(ctx, '“' + quote + '”', W / 2, startY, W * 0.8, lh);
      if (author.trim()) {
        ctx.font = `600 ${fontSize * 0.5}px Arial, sans-serif`;
        ctx.fillText('— ' + author, W / 2, startY + used + fontSize * 0.6);
      }
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
      setOutUrl(URL.createObjectURL(blob));
    } finally { setProcessing(false); }
  };

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), 'quote.jpg'); };
  const reset = () => { setBgImg(null); setOutUrl(null); };

  return (
    <ToolLayout
      title="Quote Generator"
      description="Create beautiful 1080×1080 quote images with a gradient or your own background photo. Generated in your browser."
      features={['Gradient or Photo', 'Quote + Author', 'Custom Overlay', 'PNG/JPG Export']}
    >
      <Stack spacing={3}>
        {outUrl && (
          <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
            <img src={outUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 460, objectFit: 'contain' }} />
          </Box>
        )}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <TextField label="Quote" fullWidth multiline minRows={2} value={quote} onChange={(e) => setQuote(e.target.value)} />
            <TextField label="Author" fullWidth value={author} onChange={(e) => setAuthor(e.target.value)} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <Button variant="outlined" component="label">
                {bgImg ? 'Change Background' : 'Upload Background Photo'}
                <input hidden type="file" accept="image/*" onChange={(e) => setBgImg(e.target.files?.[0] || null)} />
              </Button>
              {bgImg && <Button color="inherit" onClick={() => setBgImg(null)}>Use Gradient Instead</Button>}
            </Stack>
            {!bgImg ? (
              <Stack direction="row" spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Color 1</Typography>
                  <input aria-label="Gradient color 1" type="color" value={bg1} onChange={(e) => setBg1(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Color 2</Typography>
                  <input aria-label="Gradient color 2" type="color" value={bg2} onChange={(e) => setBg2(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
                </Box>
              </Stack>
            ) : (
              <Box>
                <Typography variant="body2">Dark Overlay: {overlay}%</Typography>
                <Slider value={overlay} min={0} max={80} onChange={(_, v) => setOverlay(v as number)} />
              </Box>
            )}
            <Box>
              <Typography variant="body2">Font Size: {fontSize}px</Typography>
              <Slider value={fontSize} min={32} max={100} onChange={(_, v) => setFontSize(v as number)} />
            </Box>
          </Stack>
        </Card>
        <ActionButtons onReset={reset} onProcess={render} onDownload={download} processing={processing} processed={!!outUrl} />
      </Stack>
    </ToolLayout>
  );
}
