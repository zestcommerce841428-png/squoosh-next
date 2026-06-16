'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Slider, Button } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, replaceExt } from '@/lib/imageTools';

export default function BackgroundRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(40);
  const [pickColor, setPickColor] = useState<{ r: number; g: number; b: number } | null>(null);

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setFile(f); setOriginalUrl(URL.createObjectURL(f)); setOutUrl(null); setError(null); setPickColor(null);
  };

  // Pick the background colour by clicking the preview.
  const onPreviewClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    if (!originalUrl) return;
    const imgEl = e.currentTarget;
    const rect = imgEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * imgEl.naturalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * imgEl.naturalHeight;
    const img = await fileToImage(file!);
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const px = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    setPickColor({ r: px[0], g: px[1], b: px[2] });
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
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = data.data;
      // Default target = top-left corner colour if none picked.
      const target = pickColor || { r: d[0], g: d[1], b: d[2] };
      const tol = (tolerance / 100) * 441; // max euclidean dist in rgb
      for (let i = 0; i < d.length; i += 4) {
        const dist = Math.sqrt((d[i] - target.r) ** 2 + (d[i + 1] - target.g) ** 2 + (d[i + 2] - target.b) ** 2);
        if (dist <= tol) d[i + 3] = 0; // make transparent
      }
      ctx.putImageData(data, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/png');
      setOutUrl(URL.createObjectURL(blob));
    } catch {
      setError('Failed to remove background.');
    } finally { setProcessing(false); }
  };

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), replaceExt(file!.name, '-no-bg.png')); };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); setPickColor(null); };

  return (
    <ToolLayout
      title="Background Remover"
      description="Remove a solid or near-solid background by colour — click the area to remove, tune the tolerance, and export a transparent PNG. 100% local."
      features={['Color-Key Removal', 'Click to Pick', 'Transparent PNG', 'No Upload']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', borderRadius: 1, p: 1, backgroundImage: 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%)', backgroundSize: '20px 20px' }}>
            <img
              src={outUrl || originalUrl!}
              alt="preview"
              onClick={!outUrl ? onPreviewClick : undefined}
              style={{ maxWidth: '100%', maxHeight: 460, objectFit: 'contain', cursor: outUrl ? 'default' : 'crosshair' }}
            />
          </Box>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2">Background color:</Typography>
                <Box sx={{ width: 28, height: 28, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: pickColor ? `rgb(${pickColor.r},${pickColor.g},${pickColor.b})` : 'transparent' }} />
                <Typography variant="caption" color="text.secondary">{pickColor ? 'Picked — click image to re-pick' : 'Click the image to pick, or uses top-left by default'}</Typography>
              </Stack>
              <Box>
                <Typography variant="body2">Tolerance: {tolerance}%</Typography>
                <Slider value={tolerance} min={5} max={90} onChange={(_, v) => setTolerance(v as number)} />
              </Box>
              {pickColor && <Button size="small" onClick={() => setPickColor(null)} sx={{ alignSelf: 'flex-start' }}>Clear picked color</Button>}
            </Stack>
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
