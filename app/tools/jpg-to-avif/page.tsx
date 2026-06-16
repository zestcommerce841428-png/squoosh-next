'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Slider } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, replaceExt, formatBytes } from '@/lib/imageTools';

export default function JpgToAvifPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSize, setOutSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(60);

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

  const download = async () => { const r = await fetch(outUrl!); downloadBlob(await r.blob(), replaceExt(file!.name, '.avif')); };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); setOutSize(0); };

  return (
    <ToolLayout
      title="JPG to AVIF"
      description="Convert JPG/PNG images to next-gen AVIF for dramatically smaller files at the same quality. Encoded in your browser."
      features={['AVIF Encode', 'Quality Control', 'Smaller Files', 'No Upload']}
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
            <Box>
              <Typography variant="body2">AVIF Quality: {quality}%</Typography>
              <Slider value={quality} min={20} max={95} onChange={(_, v) => setQuality(v as number)} />
            </Box>
            {outUrl && <Alert severity="success" sx={{ mt: 1 }}>AVIF size: <strong>{formatBytes(outSize)}</strong> (original {formatBytes(file.size)})</Alert>}
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
