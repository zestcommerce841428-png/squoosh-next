'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, TextField } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';

export default function BatchResizerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resized, setResized] = useState<{ name: string; url: string }[]>([]);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    setFiles(selectedFiles);
    setResized([]);
    setError(null);
  };

  const resizeAll = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setError(null);

    try {
      const resizedImages: { name: string; url: string }[] = [];

      for (const file of files) {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), file.type || 'image/png', 0.95);
        });

        resizedImages.push({
          name: file.name.replace(/(\.[^.]+)$/, `-${width}x${height}$1`),
          url: URL.createObjectURL(blob)
        });
      }

      setResized(resizedImages);
    } catch (err) {
      setError('Batch resize failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadAll = () => {
    resized.forEach(({ url, name }, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 100);
    });
  };

  const reset = () => {
    setFiles([]);
    setResized([]);
    setError(null);
  };

  return (
    <ToolLayout
      title="Batch Resizer"
      description="Resize multiple images at once with same dimensions - perfect for bulk photo processing"
      features={['Multi-File', 'Same Size', 'Fast Process', 'Batch Download']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {files.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', border: '2px dashed', borderColor: 'primary.main' }}>
          <Typography variant="h6" gutterBottom>
            Select Multiple Images
          </Typography>
          <Button variant="contained" component="label" sx={{ mt: 2 }}>
            Choose Images
            <input type="file" hidden multiple accept="image/*" onChange={handleFilesSelect} />
          </Button>
        </Card>
      ) : (
        <Stack spacing={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {resized.length > 0 ? `Resized ${resized.length} images` : `Selected ${files.length} images`}
            </Typography>
          </Card>

          <Card sx={{ p: 3 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Width (px)"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                fullWidth
              />
              <TextField
                label="Height (px)"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                fullWidth
              />
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {resized.length === 0 ? (
              <Button
                variant="contained"
                onClick={resizeAll}
                disabled={processing}
                fullWidth
              >
                {processing ? `Resizing ${files.length} images...` : `Resize All (${files.length})`}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadAll} fullWidth>
                Download All ({resized.length})
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
