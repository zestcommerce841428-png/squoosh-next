'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

export default function MemeGeneratorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [topText, setTopText] = useState<string>('TOP TEXT');
  const [bottomText, setBottomText] = useState<string>('BOTTOM TEXT');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setMemeUrl(null);
    setError(null);
  };

  const generateMeme = async () => {
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

      // Meme text style
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.font = `bold ${Math.max(30, img.width / 15)}px Impact`;
      ctx.textAlign = 'center';

      // Top text
      if (topText) {
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, canvas.height * 0.1);
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, canvas.height * 0.1);
      }

      // Bottom text
      if (bottomText) {
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height * 0.95);
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height * 0.95);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setMemeUrl(url);
    } catch (err) {
      setError('Meme generation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadMeme = () => {
    if (!memeUrl) return;
    const a = document.createElement('a');
    a.href = memeUrl;
    a.download = 'meme.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setMemeUrl(null);
    setError(null);
    setTopText('TOP TEXT');
    setBottomText('BOTTOM TEXT');
  };

  return (
    <ToolLayout
      title="Meme Generator"
      description="Create viral memes with top and bottom text in classic meme font"
      features={['Classic Font', 'Top/Bottom Text', 'Viral Ready', 'Quick Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {memeUrl ? (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Your Meme</Typography>
              <img src={memeUrl} alt="Meme" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : originalUrl ? (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Original" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : null}

          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Top Text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                fullWidth
                placeholder="TOP TEXT"
              />
              <TextField
                label="Bottom Text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                fullWidth
                placeholder="BOTTOM TEXT"
              />
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!memeUrl ? (
              <Button variant="contained" onClick={generateMeme} disabled={processing} fullWidth>
                {processing ? 'Creating...' : 'Create Meme'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadMeme} fullWidth>
                Download
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
