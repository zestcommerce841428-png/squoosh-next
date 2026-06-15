'use client';

import { useState } from 'react';
import { Card, Stack, Typography, Box, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ToolLayout, ActionButtons } from '@/components/ToolComponents';
import { canvasToBlob, downloadBlob } from '@/lib/imageTools';

type Shape = 'circle' | 'rounded' | 'hexagon' | 'none';
const SIZE = 800;

function path(ctx: CanvasRenderingContext2D, shape: Shape, cx: number, cy: number, r: number) {
  ctx.beginPath();
  if (shape === 'circle') ctx.arc(cx, cy, r, 0, Math.PI * 2);
  else if (shape === 'rounded') ctx.roundRect(cx - r, cy - r, r * 2, r * 2, r * 0.3);
  else if (shape === 'hexagon') {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
}

export default function LogoMakerPage() {
  const [text, setText] = useState('Brand');
  const [initials, setInitials] = useState('B');
  const [shape, setShape] = useState<Shape>('circle');
  const [bg1, setBg1] = useState('#6366f1');
  const [bg2, setBg2] = useState('#3b82f6');
  const [fg, setFg] = useState('#ffffff');
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const render = async () => {
    setProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, SIZE, SIZE);
      const cx = SIZE / 2, badgeCY = text.trim() ? SIZE * 0.4 : SIZE / 2, r = SIZE * 0.26;

      const grad = ctx.createLinearGradient(cx - r, badgeCY - r, cx + r, badgeCY + r);
      grad.addColorStop(0, bg1); grad.addColorStop(1, bg2);
      if (shape !== 'none') {
        path(ctx, shape, cx, badgeCY, r);
        ctx.fillStyle = grad; ctx.fill();
      }
      ctx.fillStyle = fg;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 ${r}px Arial, sans-serif`;
      ctx.fillText(initials.slice(0, 2).toUpperCase(), cx, badgeCY);

      if (text.trim()) {
        ctx.fillStyle = bg1;
        ctx.font = `800 ${SIZE * 0.11}px Arial, sans-serif`;
        ctx.fillText(text, cx, SIZE * 0.82);
      }
      const blob = await canvasToBlob(canvas, 'image/png');
      setOutUrl(URL.createObjectURL(blob));
    } finally { setProcessing(false); }
  };

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), 'logo.png'); };
  const reset = () => { setOutUrl(null); };

  return (
    <ToolLayout
      title="Logo Maker"
      description="Create a clean initial-based logo with a gradient badge and brand name — exported as a transparent PNG. Made in your browser."
      features={['Initial Badge', 'Gradient Fill', 'Multiple Shapes', 'Transparent PNG']}
    >
      <Stack spacing={3}>
        {outUrl && (
          <Box sx={{ textAlign: 'center', borderRadius: 1, p: 2, backgroundImage: 'repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%)', backgroundSize: '20px 20px' }}>
            <img src={outUrl} alt="logo" style={{ maxWidth: '100%', maxHeight: 400, objectFit: 'contain' }} />
          </Box>
        )}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Brand Name" fullWidth value={text} onChange={(e) => setText(e.target.value)} />
              <TextField label="Initials (1-2)" fullWidth value={initials} onChange={(e) => setInitials(e.target.value)} inputProps={{ maxLength: 2 }} />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Badge Shape</InputLabel>
              <Select value={shape} label="Badge Shape" onChange={(e) => setShape(e.target.value as Shape)}>
                <MenuItem value="circle">Circle</MenuItem>
                <MenuItem value="rounded">Rounded Square</MenuItem>
                <MenuItem value="hexagon">Hexagon</MenuItem>
                <MenuItem value="none">Text Only</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Color 1</Typography>
                <input aria-label="Gradient color 1" type="color" value={bg1} onChange={(e) => setBg1(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Color 2</Typography>
                <input aria-label="Gradient color 2" type="color" value={bg2} onChange={(e) => setBg2(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Initials</Typography>
                <input aria-label="Initials color" type="color" value={fg} onChange={(e) => setFg(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
              </Box>
            </Stack>
          </Stack>
        </Card>
        <ActionButtons onReset={reset} onProcess={render} onDownload={download} processing={processing} processed={!!outUrl} />
      </Stack>
    </ToolLayout>
  );
}
