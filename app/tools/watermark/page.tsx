'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Slider, Box, ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea, ActionButtons } from '@/components/ToolComponents';

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [watermarkText, setWatermarkText] = useState<string>('© Your Name');
  const [position, setPosition] = useState<string>('bottom-right');
  const [opacity, setOpacity] = useState<number>(50);
  const [fontSize, setFontSize] = useState<number>(32);
  const [fontColor, setFontColor] = useState<string>('#FFFFFF');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setWatermarkedUrl(null);
    setError(null);
  };

  const applyWatermark = async () => {
    if (!file || !originalUrl || !watermarkText) return;

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

      // Configure watermark text
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = fontColor;
      ctx.globalAlpha = opacity / 100;

      const textMetrics = ctx.measureText(watermarkText);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;
      const padding = 20;

      let x: number, y: number;

      switch (position) {
        case 'top-left':
          x = padding;
          y = padding + textHeight;
          break;
        case 'top-center':
          x = (canvas.width - textWidth) / 2;
          y = padding + textHeight;
          break;
        case 'top-right':
          x = canvas.width - textWidth - padding;
          y = padding + textHeight;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2;
          y = (canvas.height + textHeight) / 2;
          break;
        case 'bottom-left':
          x = padding;
          y = canvas.height - padding;
          break;
        case 'bottom-center':
          x = (canvas.width - textWidth) / 2;
          y = canvas.height - padding;
          break;
        case 'bottom-right':
        default:
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
          break;
      }

      ctx.fillText(watermarkText, x, y);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), file.type || 'image/png', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setWatermarkedUrl(url);
    } catch (err) {
      setError('Watermark application failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!watermarkedUrl || !file) return;
    const a = document.createElement('a');
    a.href = watermarkedUrl;
    a.download = file.name.replace(/(\.[^.]+)$/, '-watermarked$1');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setWatermarkedUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Watermark Tool"
      description="Add text or image watermarks to protect your images with custom positioning and opacity"
      features={['Text Watermark', '9 Positions', 'Custom Opacity', 'Batch Support']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={watermarkedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Watermark Text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                fullWidth
                placeholder="© Your Name"
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>Position</Typography>
                <ToggleButtonGroup
                  value={position}
                  exclusive
                  onChange={(e, val) => val && setPosition(val)}
                  fullWidth
                  sx={{ flexWrap: 'wrap' }}
                >
                  <ToggleButton value="top-left" sx={{ flex: '1 1 30%' }}>↖ Top Left</ToggleButton>
                  <ToggleButton value="top-center" sx={{ flex: '1 1 30%' }}>↑ Top Center</ToggleButton>
                  <ToggleButton value="top-right" sx={{ flex: '1 1 30%' }}>↗ Top Right</ToggleButton>
                  <ToggleButton value="center" sx={{ flex: '1 1 30%' }}>• Center</ToggleButton>
                  <ToggleButton value="bottom-left" sx={{ flex: '1 1 30%' }}>↙ Bottom Left</ToggleButton>
                  <ToggleButton value="bottom-center" sx={{ flex: '1 1 30%' }}>↓ Bottom Center</ToggleButton>
                  <ToggleButton value="bottom-right" sx={{ flex: '1 1 30%' }}>↘ Bottom Right</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Opacity: {opacity}%
                </Typography>
                <Slider
                  value={opacity}
                  onChange={(e, val) => setOpacity(val as number)}
                  min={10}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </Box>

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
                <Typography variant="body2" gutterBottom>
                  Text Color
                </Typography>
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
            </Stack>
          </Card>

          <ActionButtons
            onReset={reset}
            onProcess={applyWatermark}
            onDownload={downloadImage}
            processing={processing}
            processed={!!watermarkedUrl}
          />
        </Stack>
      )}
    </ToolLayout>
  );
}
