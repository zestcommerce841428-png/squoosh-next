'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Slider } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, replaceExt, formatBytes } from '@/lib/imageTools';

export default function AvifOptimizationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(50);

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
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/avif', quality / 100);
      if (blob.type !== 'image/avif') throw new Error('no-avif');
      setOutSize(blob.size);
      setOutUrl(URL.createObjectURL(blob));
    } catch {
      setError('Your browser does not support AVIF encoding. Try the latest Chrome or Edge.');
    } finally { setProcessing(false); }
  };

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), replaceExt(file!.name, '-optimized.avif')); };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); setOutSize(0); };

  const ratio = outSize && file ? Math.round((1 - outSize / file.size) * 100) : 0;

  return (
    <ToolLayout
      title="AVIF Optimization"
      description="Re-compress AVIF (or any image) to the smallest AVIF at your chosen quality. Encoded locally in your browser."
      features={['AVIF Re-encode', 'Quality Slider', 'Size Savings', 'No Upload']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
            <img src={outUrl || originalUrl!} alt="preview" style={{ maxWidth: '100%', maxHeight: 460, objectFit: 'contain' }} />
          </Box>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Box>
              <Typography variant="body2">Quality: {quality}%</Typography>
              <Slider value={quality} min={20} max={90} onChange={(_, v) => setQuality(v as number)} />
            </Box>
            {outUrl && <Alert severity="success" sx={{ mt: 1 }}>Optimized: <strong>{formatBytes(outSize)}</strong> — saved {ratio}% vs original ({formatBytes(file.size)})</Alert>}
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
