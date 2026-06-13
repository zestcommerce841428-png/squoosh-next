'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

export default function InstagramStoryPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [storyUrl, setStoryUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setStoryUrl(null);
    setError(null);
  };

  const createStory = async () => {
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
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;

      const scale = Math.max(1080 / img.width, 1920 / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (1080 - scaledWidth) / 2;
      const y = (1920 - scaledHeight) / 2;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      if (text) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 1700, 1080, 220);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text.substring(0, 25), 540, 1800);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92);
      });

      const url = URL.createObjectURL(blob);
      setStoryUrl(url);
    } catch (err) {
      setError('Story creation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadStory = () => {
    if (!storyUrl) return;
    const a = document.createElement('a');
    a.href = storyUrl;
    a.download = 'instagram-story-1080x1920.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setStoryUrl(null);
    setError(null);
    setText('');
  };

  return (
    <ToolLayout
      title="Instagram Story Creator"
      description="Create perfect 1080×1920 Instagram stories with text overlays and effects"
      features={['1080×1920', 'Text Overlay', 'Effects', 'Instant Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {storyUrl ? (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Instagram Story (1080×1920)</Typography>
              <img src={storyUrl} alt="Story" style={{ width: '100%', height: 'auto', maxHeight: 600 }} />
            </Card>
          ) : originalUrl ? (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Original" style={{ width: '100%', height: 'auto', maxHeight: 600 }} />
            </Card>
          ) : null}

          <Card sx={{ p: 3 }}>
            <TextField
              label="Text (Optional)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              placeholder="Add text..."
              helperText="Will appear at the bottom"
            />
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!storyUrl ? (
              <Button variant="contained" onClick={createStory} disabled={processing} fullWidth>
                {processing ? 'Creating...' : 'Create Story'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadStory} fullWidth>
                Download
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
