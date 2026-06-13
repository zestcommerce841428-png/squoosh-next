'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

export default function YouTubeThumbnailPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setThumbnailUrl(null);
    setError(null);
  };

  const createThumbnail = async () => {
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
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d')!;

      const scale = Math.max(1280 / img.width, 720 / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (1280 - scaledWidth) / 2;
      const y = (720 - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      if (title) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 550, 1280, 170);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title.substring(0, 20), 640, 650);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setThumbnailUrl(url);
    } catch (err) {
      setError('Thumbnail creation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadThumbnail = () => {
    if (!thumbnailUrl) return;
    const a = document.createElement('a');
    a.href = thumbnailUrl;
    a.download = 'youtube-thumbnail-1280x720.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setThumbnailUrl(null);
    setError(null);
    setTitle('');
  };

  return (
    <ToolLayout
      title="YouTube Thumbnail Maker"
      description="Create eye-catching 1280×720 YouTube thumbnails with text overlays"
      features={['1280×720', 'Text Overlay', 'High Quality', 'Instant Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {thumbnailUrl ? (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>YouTube Thumbnail (1280×720)</Typography>
              <img src={thumbnailUrl} alt="Thumbnail" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : originalUrl ? (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Original" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : null}

          <Card sx={{ p: 3 }}>
            <TextField
              label="Title (Optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              placeholder="Add video title..."
              helperText="Will appear at the bottom"
            />
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!thumbnailUrl ? (
              <Button variant="contained" onClick={createThumbnail} disabled={processing} fullWidth>
                {processing ? 'Creating...' : 'Create Thumbnail'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadThumbnail} fullWidth>
                Download
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
