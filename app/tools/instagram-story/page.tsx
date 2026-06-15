'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob } from '@/lib/imageTools';

const W = 1080, H = 1920;

export default function InstagramStoryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'cover' | 'contain'>('cover');
  const [bg, setBg] = useState('#000000');

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
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const scale = mode === 'cover' ? Math.max(W / img.width, H / img.height) : Math.min(W / img.width, H / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
      setOutUrl(URL.createObjectURL(blob));
    } catch { setError('Failed to process image.'); }
    finally { setProcessing(false); }
  };

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), 'instagram-story.jpg'); };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); };

  return (
    <ToolLayout
      title="Instagram Story"
      description="Resize any photo to a full-screen 1080×1920 (9:16) Instagram/Reels story — crop to fill or fit with a background. Local processing."
      features={['1080×1920', 'Crop or Fit', 'Background Color', 'No Upload']}
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
              <ToggleButtonGroup color="primary" exclusive value={mode} onChange={(_, v) => v && setMode(v)} fullWidth>
                <ToggleButton value="cover">Crop to Fill</ToggleButton>
                <ToggleButton value="contain">Fit (with bg)</ToggleButton>
              </ToggleButtonGroup>
              {mode === 'contain' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Background</Typography>
                  <input aria-label="Background color" type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
                </Box>
              )}
            </Stack>
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
