'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Slider, Box, ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';

export default function TextToImagePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [text, setText] = useState<string>('Hello World');
  const [fontSize, setFontSize] = useState<number>(48);
  const [fontColor, setFontColor] = useState<string>('#FFFFFF');
  const [bgColor, setBgColor] = useState<string>('#3b82f6');
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(400);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');

  const generateImage = async () => {
    if (!text) return;

    setProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Text
      ctx.fillStyle = fontColor;
      ctx.font = `${fontSize}px Arial`;
      ctx.textBaseline = 'middle';
      
      let textX: number;
      if (alignment === 'left') {
        ctx.textAlign = 'left';
        textX = 40;
      } else if (alignment === 'right') {
        ctx.textAlign = 'right';
        textX = width - 40;
      } else {
        ctx.textAlign = 'center';
        textX = width / 2;
      }

      const lines = text.split('\n');
      const lineHeight = fontSize * 1.5;
      const totalHeight = lines.length * lineHeight;
      const startY = (height - totalHeight) / 2 + lineHeight / 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, textX, startY + i * lineHeight);
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      setError('Generation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'text-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setImageUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Text to Image"
      description="Convert text into images with custom fonts, colors, and backgrounds"
      features={['Custom Fonts', 'Any Size', 'Multi-line', 'Alignment']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Stack spacing={3}>
        {imageUrl && (
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Generated Image</Typography>
            <img src={imageUrl} alt="Generated" style={{ width: '100%', height: 'auto' }} />
          </Card>
        )}

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Enter your text here"
            />

            <Box>
              <Typography variant="body2" gutterBottom>
                Font Size: {fontSize}px
              </Typography>
              <Slider
                value={fontSize}
                onChange={(e, val) => setFontSize(val as number)}
                min={16}
                max={120}
                valueLabelDisplay="auto"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Alignment</Typography>
              <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={(e, val) => val && setAlignment(val)}
                fullWidth
              >
                <ToggleButton value="left">Left</ToggleButton>
                <ToggleButton value="center">Center</ToggleButton>
                <ToggleButton value="right">Right</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>Text Color</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  style={{ width: 60, height: 40, cursor: 'pointer', border: 'none' }}
                />
                <Typography variant="body2">{fontColor}</Typography>
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
          </Stack>
        </Card>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={reset} fullWidth>
            Reset
          </Button>
          {!imageUrl ? (
            <Button
              variant="contained"
              onClick={generateImage}
              disabled={processing || !text}
              fullWidth
            >
              {processing ? 'Generating...' : 'Generate Image'}
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={downloadImage} fullWidth>
              Download
            </Button>
          )}
        </Stack>
      </Stack>
    </ToolLayout>
  );
}
