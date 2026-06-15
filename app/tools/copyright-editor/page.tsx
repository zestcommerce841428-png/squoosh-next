'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, TextField } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, replaceExt } from '@/lib/imageTools';

export default function CopyrightEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const year = new Date().getFullYear();
  const [notice, setNotice] = useState(`© ${year} Your Name — All Rights Reserved`);

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
      const fontSize = Math.max(14, img.width * 0.022);
      ctx.font = `600 ${fontSize}px Arial, sans-serif`;
      const metrics = ctx.measureText(notice);
      const pad = fontSize * 0.6;
      const barH = fontSize + pad * 1.4;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, img.height - barH, metrics.width + pad * 2, barH);
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(notice, pad, img.height - barH / 2);
      const blob = await canvasToBlob(canvas, 'image/png');
      setOutUrl(URL.createObjectURL(blob));
    } catch { setError('Failed to add copyright.'); }
    finally { setProcessing(false); }
  };

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), replaceExt(file!.name, '-copyright.png')); };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); };

  return (
    <ToolLayout
      title="Copyright Editor"
      description="Stamp a visible copyright notice onto your photos before sharing them. Processed entirely on your device."
      features={['Copyright Notice', 'Auto Year', 'Readable Backplate', 'PNG Export']}
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
            <TextField label="Copyright Notice" fullWidth value={notice} onChange={(e) => setNotice(e.target.value)} />
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
