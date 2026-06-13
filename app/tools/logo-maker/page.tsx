'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Box, Button, Slider } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';

export default function LogoMakerPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [text, setText] = useState<string>('LOGO');
  const [fontSize, setFontSize] = useState<number>(100);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [bgColor, setBgColor] = useState<string>('#3b82f6');

  const generateLogo = async () => {
    if (!text) return;

    setProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;

      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, bgColor);
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      // Text
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 256);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const url = URL.createObjectURL(blob);
      setLogoUrl(url);
    } catch (err) {
      setError('Logo generation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadLogo = () => {
    if (!logoUrl) return;
    const a = document.createElement('a');
    a.href = logoUrl;
    a.download = 'logo-512x512.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setLogoUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Logo Maker"
      description="Create simple text-based logos with custom colors and fonts"
      features={['Text Logo', 'Custom Colors', 'PNG Export', 'Transparent']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Stack spacing={3}>
        {logoUrl && (
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Your Logo (512×512)</Typography>
            <Box sx={{ display: 'inline-block', p: 2, bgcolor: '#f5f5f5' }}>
              <img src={logoUrl} alt="Logo" style={{ width: 300, height: 300 }} />
            </Box>
          </Card>
        )}

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Logo Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              placeholder="Enter text"
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                Font Size: {fontSize}px
              </Typography>
              <Slider
                value={fontSize}
                onChange={(e, val) => setFontSize(val as number)}
                min={40}
                max={150}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>Text Color</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  style={{ width: 60, height: 40, cursor: 'pointer', border: 'none' }}
                />
                <Typography variant="body2">{textColor}</Typography>
              </Stack>
            </Box>

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
          {!logoUrl ? (
            <Button variant="contained" onClick={generateLogo} disabled={processing || !text} fullWidth>
              {processing ? 'Generating...' : 'Generate Logo'}
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={downloadLogo} fullWidth>
              Download
            </Button>
          )}
        </Stack>
      </Stack>
    </ToolLayout>
  );
}
