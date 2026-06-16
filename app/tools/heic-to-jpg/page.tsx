'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Slider } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { downloadBlob, replaceExt, formatBytes } from '@/lib/imageTools';

export default function HeicToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(92);

  const handleFileSelect = (f: File) => {
    const ok = /\.(heic|heif)$/i.test(f.name) || f.type.includes('heic') || f.type.includes('heif');
    if (!ok) { setError('Please choose a .heic or .heif file.'); return; }
    setFile(f); setOutUrl(null); setOutBlob(null); setError(null);
  };

  const apply = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const heic2any = (await import('heic2any')).default;
      const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: quality / 100 });
      const blob = Array.isArray(result) ? result[0] : result;
      setOutBlob(blob);
      setOutUrl(URL.createObjectURL(blob));
    } catch {
      setError('Could not convert this file. Make sure it is a valid HEIC/HEIF image.');
    } finally { setProcessing(false); }
  };

  const download = () => { if (outBlob && file) downloadBlob(outBlob, replaceExt(file.name, '.jpg')); };
  const reset = () => { setFile(null); setOutUrl(null); setOutBlob(null); setError(null); };

  return (
    <ToolLayout
      title="HEIC to JPG"
      description="Convert iPhone HEIC/HEIF photos to universal JPG — decoded entirely in your browser, nothing uploaded."
      features={['HEIC & HEIF', 'Quality Control', 'Client-Side Decode', 'No Upload']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept=".heic,.heif,image/heic,image/heif" maxSize={50} />
      ) : (
        <Stack spacing={3}>
          {outUrl ? (
            <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
              <img src={outUrl} alt="converted" style={{ maxWidth: '100%', maxHeight: 460, objectFit: 'contain' }} />
            </Box>
          ) : (
            <Alert severity="info">Selected: <strong>{file.name}</strong> ({formatBytes(file.size)}). HEIC can&apos;t be previewed until converted — press Process.</Alert>
          )}
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Box>
              <Typography variant="body2">JPG Quality: {quality}%</Typography>
              <Slider value={quality} min={50} max={100} onChange={(_, v) => setQuality(v as number)} />
            </Box>
            {outBlob && <Alert severity="success" sx={{ mt: 1 }}>Converted size: <strong>{formatBytes(outBlob.size)}</strong></Alert>}
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
