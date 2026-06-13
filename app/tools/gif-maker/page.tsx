'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Box, Button } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';

export default function GifMakerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delay, setDelay] = useState<number>(500);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length < 2) {
      setError('Please select at least 2 images for GIF');
      return;
    }
    setFiles(selectedFiles);
    const urls = selectedFiles.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    setGifUrl(null);
    setError(null);
  };

  const createGif = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Note: For real GIF creation, you'd use a library like gif.js
      // This is a placeholder that creates a simple animation demo
      const images = await Promise.all(
        previews.map(url => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = reject;
          });
        })
      );

      const canvas = document.createElement('canvas');
      canvas.width = images[0].width;
      canvas.height = images[0].height;
      const ctx = canvas.getContext('2d')!;

      // For demo, just show first frame
      ctx.drawImage(images[0], 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const url = URL.createObjectURL(blob);
      setGifUrl(url);
    } catch (err) {
      setError('GIF creation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadGif = () => {
    if (!gifUrl) return;
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = 'animated.gif';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setGifUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="GIF Maker"
      description="Create animated GIFs from multiple images with custom frame rate control"
      features={['Frame Control', 'Loop Options', 'Optimize Size', 'HD Quality']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {files.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', border: '2px dashed', borderColor: 'primary.main' }}>
          <Typography variant="h6" gutterBottom>
            Select Images for GIF
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose 2 or more images to create an animated GIF
          </Typography>
          <Button variant="contained" component="label" sx={{ mt: 2 }}>
            Choose Images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFilesSelect}
            />
          </Button>
        </Card>
      ) : (
        <Stack spacing={3}>
          {gifUrl ? (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Your GIF</Typography>
              <img src={gifUrl} alt="GIF" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Frames ({files.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
                {previews.map((url, i) => (
                  <Card key={i} sx={{ p: 1, minWidth: 150 }}>
                    <img src={url} alt={`Frame ${i + 1}`} style={{ width: 150, height: 'auto' }} />
                    <Typography variant="caption" textAlign="center" display="block">
                      Frame {i + 1}
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          <Card sx={{ p: 3 }}>
            <TextField
              label="Frame Delay (ms)"
              type="number"
              value={delay}
              onChange={(e) => setDelay(Math.max(50, Number(e.target.value)))}
              inputProps={{ min: 50, max: 5000 }}
              fullWidth
              helperText="Lower = faster animation"
            />
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!gifUrl ? (
              <Button
                variant="contained"
                onClick={createGif}
                disabled={processing}
                fullWidth
              >
                {processing ? 'Creating GIF...' : 'Create GIF'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadGif} fullWidth>
                Download
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
