'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Box, Button } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';

export default function PosterMakerPage() {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState<string>('Event Title');
  const [subtitle, setSubtitle] = useState<string>('Date & Location');
  const [bgColor, setBgColor] = useState<string>('#6366f1');

  const generatePoster = async () => {
    if (!title) return;

    setProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, bgColor);
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(title.substring(0, 15), 540, 900);

      // Subtitle
      ctx.font = '60px Arial';
      ctx.fillText(subtitle.substring(0, 25), 540, 1050);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setPosterUrl(url);
    } catch (err) {
      setError('Poster generation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadPoster = () => {
    if (!posterUrl) return;
    const a = document.createElement('a');
    a.href = posterUrl;
    a.download = 'poster-1080x1920.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setPosterUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Poster Maker"
      description="Create professional event posters and promotional graphics"
      features={['Custom Text', 'Gradients', 'Print Ready', 'HD Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Stack spacing={3}>
        {posterUrl && (
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Your Poster (1080×1920)</Typography>
            <img src={posterUrl} alt="Poster" style={{ width: '100%', height: 'auto', maxHeight: 600 }} />
          </Card>
        )}

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              placeholder="Event Title"
            />

            <TextField
              label="Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              fullWidth
              placeholder="Date & Location"
            />

            <Box>
              <Typography variant="body2" gutterBottom>Background Color</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  style={{ width: 60, height: 40, cursor: 'pointer', border: 'none' }}
                />
                <Typography variant="body2">{bgColor}</Typography>
              </Stack>
            </Box>
          </Stack>
        </Card>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={reset} fullWidth>
            Reset
          </Button>
          {!posterUrl ? (
            <Button variant="contained" onClick={generatePoster} disabled={processing || !title} fullWidth>
              {processing ? 'Generating...' : 'Generate Poster'}
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={downloadPoster} fullWidth>
              Download
            </Button>
          )}
        </Stack>
      </Stack>
    </ToolLayout>
  );
}
