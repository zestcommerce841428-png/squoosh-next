'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Slider } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, replaceExt, formatBytes } from '@/lib/imageTools';

export default function AvifToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(92);

  const handleFileSelect = (f: File) => {
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
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/jpeg', quality / 100);
      setOutSize(blob.size);
      setOutUrl(URL.createObjectURL(blob));
    } catch {
      setError('Could not decode this AVIF. Your browser may not support AVIF decoding — try Chrome/Edge/Firefox.');
    } finally { setProcessing(false); }
  };

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), replaceExt(file!.name, '.jpg')); };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); setOutSize(0); };

  return (
    <ToolLayout
      title="AVIF to JPG"
      description="Convert AVIF images to widely-compatible JPG files right in your browser — nothing is uploaded."
      features={['AVIF Decode', 'Quality Control', 'Instant Convert', 'No Upload']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/avif,.avif" />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
            <img src={outUrl || originalUrl!} alt="preview" style={{ maxWidth: '100%', maxHeight: 460, objectFit: 'contain' }} />
          </Box>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Box>
              <Typography variant="body2">JPG Quality: {quality}%</Typography>
              <Slider value={quality} min={50} max={100} onChange={(_, v) => setQuality(v as number)} />
            </Box>
            {outUrl && <Alert severity="success" sx={{ mt: 1 }}>Converted size: <strong>{formatBytes(outSize)}</strong></Alert>}
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
