'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Box, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

export default function InstagramPostPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [postUrl, setPostUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setPostUrl(null);
    setError(null);
  };

  const createPost = async () => {
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
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d')!;

      const scale = Math.max(1080 / img.width, 1080 / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (1080 - scaledWidth) / 2;
      const y = (1080 - scaledHeight) / 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1080, 1080);
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      if (caption) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 950, 1080, 130);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(caption.substring(0, 30), 540, 1010);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92);
      });

      const url = URL.createObjectURL(blob);
      setPostUrl(url);
    } catch (err) {
      setError('Post creation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadPost = () => {
    if (!postUrl) return;
    const a = document.createElement('a');
    a.href = postUrl;
    a.download = 'instagram-post-1080x1080.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setPostUrl(null);
    setError(null);
    setCaption('');
  };

  return (
    <ToolLayout
      title="Instagram Post Creator"
      description="Create perfect 1080×1080 Instagram posts with captions and filters"
      features={['1080×1080', 'Captions', 'Filters', 'Instant Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {postUrl ? (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Instagram Post (1080×1080)</Typography>
              <img src={postUrl} alt="Post" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : originalUrl ? (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Original" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : null}

          <Card sx={{ p: 3 }}>
            <TextField
              label="Caption (Optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              fullWidth
              placeholder="Add a caption..."
              helperText="Will appear at the bottom"
            />
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!postUrl ? (
              <Button variant="contained" onClick={createPost} disabled={processing} fullWidth>
                {processing ? 'Creating...' : 'Create Post'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadPost} fullWidth>
                Download
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
