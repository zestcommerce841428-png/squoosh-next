'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, TextField, Slider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ToolLayout, ActionButtons } from '@/components/ToolComponents';
import { canvasToBlob, downloadBlob, drawWrappedText } from '@/lib/imageTools';

const SIZES: Record<string, [number, number]> = {
  'Square (1080×1080)': [1080, 1080],
  'Landscape (1280×720)': [1280, 720],
  'Portrait (1080×1350)': [1080, 1350],
  'Story (1080×1920)': [1080, 1920],
};

export default function TextToImagePage() {
  const [text, setText] = useState('Your text here');
  const [size, setSize] = useState('Square (1080×1080)');
  const [bg, setBg] = useState('#6366f1');
  const [fg, setFg] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(72);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const render = async () => {
    setProcessing(true);
    try {
      const [w, h] = SIZES[size];
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = fg;
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lineHeight = fontSize * 1.25;
      // estimate lines to vertically center
      const tmpWords = text.split(/\s+/);
      let lineCount = 1, cur = '';
      for (const word of tmpWords) {
        const t = cur ? cur + ' ' + word : word;
        if (ctx.measureText(t).width > w * 0.85 && cur) { lineCount++; cur = word; } else cur = t;
      }
      const startY = h / 2 - ((lineCount - 1) * lineHeight) / 2;
      drawWrappedText(ctx, text, w / 2, startY, w * 0.85, lineHeight);
      const blob = await canvasToBlob(canvas, 'image/png');
      setOutUrl(URL.createObjectURL(blob));
    } finally { setProcessing(false); }
  };

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), 'text-image.png'); };
  const reset = () => { setText('Your text here'); setOutUrl(null); };

  return (
    <ToolLayout
      title="Text to Image"
      description="Turn any text into a downloadable image for social posts, quotes and thumbnails. Generated in your browser."
      features={['Social Presets', 'Custom Colors', 'Auto Word-Wrap', 'PNG Export']}
    >
      <Stack spacing={3}>
        {outUrl && (
          <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
            <img src={outUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 460, objectFit: 'contain' }} />
          </Box>
        )}
        <Card sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2.5}>
            <TextField label="Text" fullWidth multiline minRows={2} value={text} onChange={(e) => setText(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Canvas Size</InputLabel>
              <Select value={size} label="Canvas Size" onChange={(e) => setSize(e.target.value)}>
                {Object.keys(SIZES).map((k) => <MenuItem key={k} value={k}>{k}</MenuItem>)}
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Background</Typography>
                <input aria-label="Background color" type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Text Color</Typography>
                <input aria-label="Text color" type="color" value={fg} onChange={(e) => setFg(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
              </Box>
            </Stack>
            <Box>
              <Typography variant="body2">Font Size: {fontSize}px</Typography>
              <Slider value={fontSize} min={24} max={160} onChange={(_, v) => setFontSize(v as number)} />
            </Box>
          </Stack>
        </Card>
        <ActionButtons onReset={reset} onProcess={render} onDownload={download} processing={processing} processed={!!outUrl} />
      </Stack>
    </ToolLayout>
  );
}
