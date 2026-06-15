'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Slider } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, replaceExt } from '@/lib/imageTools';

export default function BorderToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [width, setWidth] = useState(20);
  const [radius, setRadius] = useState(0);
  const [color, setColor] = useState('#ffffff');

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setFile(f); setOriginalUrl(URL.createObjectURL(f)); setOutUrl(null); setError(null);
  };

  const apply = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const img = await fileToImage(file);
      const b = width;
      const canvas = document.createElement('canvas');
      canvas.width = img.width + b * 2;
      canvas.height = img.height + b * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (radius > 0) {
        ctx.save();
        const r = Math.min(radius, img.width / 2, img.height / 2);
        ctx.beginPath();
        ctx.roundRect(b, b, img.width, img.height, r);
        ctx.clip();
      }
      ctx.drawImage(img, b, b);
      if (radius > 0) ctx.restore();
      const blob = await canvasToBlob(canvas, 'image/png');
      setOutUrl(URL.createObjectURL(blob));
    } catch { setError('Failed to add border.'); }
    finally { setProcessing(false); }
  };

  const download = async () => {
    if (!file) return;
    const res = await fetch(outUrl!);
    downloadBlob(await res.blob(), replaceExt(file.name, '-bordered.png'));
  };

  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); };

  return (
    <ToolLayout
      title="Border Tool"
      description="Add a solid color border (with optional rounded corners) around any image — processed locally."
      features={['Custom Width', 'Any Color', 'Rounded Corners', 'PNG Output']}
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Border Color</Typography>
                <input aria-label="Border color" type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
              </Box>
              <Box>
                <Typography variant="body2">Border Width: {width}px</Typography>
                <Slider value={width} min={0} max={150} onChange={(_, v) => setWidth(v as number)} />
              </Box>
              <Box>
                <Typography variant="body2">Corner Radius: {radius}px</Typography>
                <Slider value={radius} min={0} max={300} onChange={(_, v) => setRadius(v as number)} />
              </Box>
            </Stack>
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
