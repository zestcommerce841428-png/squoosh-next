'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Slider, Box, TextField } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea, ActionButtons } from '@/components/ToolComponents';

export default function BorderToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [borderedUrl, setBorderedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [borderWidth, setBorderWidth] = useState<number>(20);
  const [borderColor, setBorderColor] = useState<string>('#FFFFFF');
  const [borderRadius, setBorderRadius] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setBorderedUrl(null);
    setError(null);
  };

  const applyBorder = async () => {
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
      canvas.width = img.width + borderWidth * 2;
      canvas.height = img.height + borderWidth * 2;
      const ctx = canvas.getContext('2d')!;

      // Draw border background
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image with optional rounded corners
      if (borderRadius > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(borderWidth, borderWidth, img.width, img.height, borderRadius);
        ctx.clip();
      }

      ctx.drawImage(img, borderWidth, borderWidth);

      if (borderRadius > 0) {
        ctx.restore();
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const url = URL.createObjectURL(blob);
      setBorderedUrl(url);
    } catch (err) {
      setError('Border application failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!borderedUrl || !file) return;
    const a = document.createElement('a');
    a.href = borderedUrl;
    a.download = file.name.replace(/(\.[^.]+)$/, '-bordered.png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setBorderedUrl(null);
    setError(null);
    setBorderWidth(20);
    setBorderColor('#FFFFFF');
    setBorderRadius(0);
  };

  return (
    <ToolLayout
      title="Border Tool"
      description="Add custom borders and frames to your images with color and radius control"
      features={['Custom Width', 'Any Color', 'Rounded Corners', 'Transparent']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={borderedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Border Width: {borderWidth}px
                </Typography>
                <Slider
                  value={borderWidth}
                  onChange={(e, val) => setBorderWidth(val as number)}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Border Radius: {borderRadius}px
                </Typography>
                <Slider
                  value={borderRadius}
                  onChange={(e, val) => setBorderRadius(val as number)}
                  min={0}
                  max={50}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Border Color
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    style={{ width: 60, height: 40, cursor: 'pointer', border: 'none' }}
                  />
                  <TextField
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    size="small"
                    placeholder="#FFFFFF"
                  />
                </Stack>
              </Box>
            </Stack>
          </Card>

          <ActionButtons
            onReset={reset}
            onProcess={applyBorder}
            onDownload={downloadImage}
            processing={processing}
            processed={!!borderedUrl}
          />
        </Stack>
      )}
    </ToolLayout>
  );
}
