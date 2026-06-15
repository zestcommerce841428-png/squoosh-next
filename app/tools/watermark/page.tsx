'use client';

import { useState, useRef } from 'react';
import {
  Card, Stack, Alert, Typography, TextField, Box, Slider, FormControlLabel,
  Switch, Select, MenuItem, InputLabel, FormControl,
} from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';

type Pos = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState('© Your Brand');
  const [opacity, setOpacity] = useState(40);
  const [size, setSize] = useState(5);
  const [color, setColor] = useState('#ffffff');
  const [position, setPosition] = useState<Pos>('bottom-right');
  const [tiled, setTiled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setFile(f);
    setOriginalUrl(URL.createObjectURL(f));
    setOutUrl(null);
    setError(null);
  };

  const apply = async () => {
    if (!file || !originalUrl) return;
    setProcessing(true);
    setError(null);
    try {
      const img = new Image();
      img.src = originalUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const canvas = canvasRef.current ?? document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(12, (size / 100) * img.width);
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity / 100;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = fontSize / 8;

      if (tiled) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const metrics = ctx.measureText(text);
        const stepX = metrics.width + fontSize * 2;
        const stepY = fontSize * 3;
        ctx.save();
        ctx.translate(img.width / 2, img.height / 2);
        ctx.rotate(-Math.PI / 6);
        for (let y = -img.height; y < img.height; y += stepY) {
          for (let x = -img.width; x < img.width; x += stepX) {
            ctx.fillText(text, x, y);
          }
        }
        ctx.restore();
      } else {
        const pad = fontSize * 0.5;
        const metrics = ctx.measureText(text);
        let x = pad, y = pad + fontSize;
        ctx.textBaseline = 'alphabetic';
        if (position.includes('right')) x = img.width - metrics.width - pad;
        if (position.includes('bottom')) y = img.height - pad;
        if (position === 'center') { x = (img.width - metrics.width) / 2; y = img.height / 2; }
        ctx.fillText(text, x, y);
      }
      ctx.globalAlpha = 1;

      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/png'));
      setOutUrl(URL.createObjectURL(blob));
    } catch {
      setError('Failed to apply watermark.');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!outUrl || !file) return;
    const a = document.createElement('a');
    a.href = outUrl;
    a.download = file.name.replace(/\.[^.]+$/, '-watermarked.png');
    a.click();
  };

  const reset = () => {
    setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null);
  };

  return (
    <ToolLayout
      title="Watermark Tool"
      description="Add a text watermark to your images — single placement or tiled across the whole image. Runs entirely in your browser."
      features={['Text Watermark', 'Tiled Mode', 'Opacity & Color', 'No Upload']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ width: '100%', textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
            <img
              src={outUrl || originalUrl!}
              alt={outUrl ? 'Watermarked' : 'Original'}
              style={{ maxWidth: '100%', maxHeight: 480, objectFit: 'contain' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>

          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <TextField label="Watermark Text" fullWidth value={text} onChange={(e) => setText(e.target.value)} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth disabled={tiled}>
                  <InputLabel>Position</InputLabel>
                  <Select value={position} label="Position" onChange={(e) => setPosition(e.target.value as Pos)}>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="top-left">Top Left</MenuItem>
                    <MenuItem value="top-right">Top Right</MenuItem>
                    <MenuItem value="bottom-left">Bottom Left</MenuItem>
                    <MenuItem value="bottom-right">Bottom Right</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Color</Typography>
                  <input aria-label="Watermark color" type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
                </Box>
              </Stack>
              <Box>
                <Typography variant="body2">Opacity: {opacity}%</Typography>
                <Slider value={opacity} min={5} max={100} onChange={(_, v) => setOpacity(v as number)} />
              </Box>
              <Box>
                <Typography variant="body2">Text Size: {size}%</Typography>
                <Slider value={size} min={2} max={20} onChange={(_, v) => setSize(v as number)} />
              </Box>
              <FormControlLabel control={<Switch checked={tiled} onChange={(e) => setTiled(e.target.checked)} />} label="Tile across entire image" />
            </Stack>
          </Card>

          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
