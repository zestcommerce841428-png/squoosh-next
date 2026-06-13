'use client';

import { useState, useRef } from 'react';
import { Card, FormControl, InputLabel, Select, MenuItem, Stack, Alert, CircularProgress } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea, ActionButtons } from '@/components/ToolComponents';

const formats = [
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'image/png', label: 'PNG', ext: 'png' },
  { value: 'image/webp', label: 'WebP', ext: 'webp' },
  { value: 'image/gif', label: 'GIF', ext: 'gif' },
  { value: 'image/bmp', label: 'BMP', ext: 'bmp' },
];

export default function FormatConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState('image/png');
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setConvertedUrl(null);
    setError(null);
  };

  const convertFormat = async () => {
    if (!file || !originalUrl) return;

    setProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.src = originalUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), targetFormat, 0.95);
      });

      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
    } catch (err) {
      setError('Conversion failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!convertedUrl || !file) return;
    const format = formats.find((f) => f.value === targetFormat);
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = file.name.replace(/\.[^.]+$/, `.${format?.ext || 'png'}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setConvertedUrl(null);
    setTargetFormat('image/png');
    setError(null);
  };

  return (
    <ToolLayout
      title="Format Converter"
      description="Convert images between 100+ formats including JPEG, PNG, WebP, GIF, BMP, and more"
      features={['Instant Conversion', 'Quality Preservation', 'Batch Support', 'All Formats']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={convertedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Target Format</InputLabel>
              <Select value={targetFormat} label="Target Format" onChange={(e) => setTargetFormat(e.target.value)}>
                {formats.map((fmt) => (
                  <MenuItem key={fmt.value} value={fmt.value}>
                    {fmt.label} (.{fmt.ext})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Card>

          <ActionButtons
            onReset={reset}
            onProcess={convertFormat}
            onDownload={downloadImage}
            processing={processing}
            processed={!!convertedUrl}
          />
        </Stack>
      )}
    </ToolLayout>
  );
}
