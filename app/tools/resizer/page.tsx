'use client';

import { useState } from 'react';
import { Card, TextField, Stack, Alert, FormControlLabel, Checkbox, ToggleButtonGroup, ToggleButton, Typography, Box } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea, ActionButtons } from '@/components/ToolComponents';

export default function ResizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [resizeMode, setResizeMode] = useState<'percentage' | 'pixels'>('pixels');
  const [percentage, setPercentage] = useState<number>(50);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setResizedUrl(null);
    setError(null);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
    };
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspect && originalWidth > 0) {
      const aspectRatio = originalHeight / originalWidth;
      setHeight(Math.round(newWidth * aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspect && originalHeight > 0) {
      const aspectRatio = originalWidth / originalHeight;
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handlePercentageChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    if (originalWidth > 0 && originalHeight > 0) {
      setWidth(Math.round(originalWidth * newPercentage / 100));
      setHeight(Math.round(originalHeight * newPercentage / 100));
    }
  };

  const resizeImage = async () => {
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

      const finalWidth = resizeMode === 'percentage' ? Math.round(img.width * percentage / 100) : width;
      const finalHeight = resizeMode === 'percentage' ? Math.round(img.height * percentage / 100) : height;

      const canvas = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      const ctx = canvas.getContext('2d')!;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), file.type || 'image/png', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setResizedUrl(url);
    } catch (err) {
      setError('Resize failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resizedUrl || !file) return;
    const a = document.createElement('a');
    a.href = resizedUrl;
    a.download = file.name.replace(/(\.[^.]+)$/, '-resized$1');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setResizedUrl(null);
    setError(null);
    setWidth(800);
    setHeight(600);
    setPercentage(50);
  };

  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images to any dimension with smart aspect ratio control and quality preservation"
      features={['Pixel/Percentage Mode', 'Aspect Ratio Lock', 'High Quality', 'Batch Support']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={resizedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Original: {originalWidth} × {originalHeight} px
                </Typography>
                <Typography variant="body2" color="primary">
                  New: {resizeMode === 'percentage' ? Math.round(originalWidth * percentage / 100) : width} × {resizeMode === 'percentage' ? Math.round(originalHeight * percentage / 100) : height} px
                </Typography>
              </Box>

              <ToggleButtonGroup
                value={resizeMode}
                exclusive
                onChange={(e, val) => val && setResizeMode(val)}
                fullWidth
              >
                <ToggleButton value="pixels">Pixels</ToggleButton>
                <ToggleButton value="percentage">Percentage</ToggleButton>
              </ToggleButtonGroup>

              {resizeMode === 'pixels' ? (
                <Stack spacing={2}>
                  <TextField
                    label="Width (px)"
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    fullWidth
                  />
                  <TextField
                    label="Height (px)"
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={maintainAspect}
                        onChange={(e) => setMaintainAspect(e.target.checked)}
                      />
                    }
                    label="Lock aspect ratio"
                  />
                </Stack>
              ) : (
                <TextField
                  label="Resize Percentage"
                  type="number"
                  value={percentage}
                  onChange={(e) => handlePercentageChange(Number(e.target.value))}
                  fullWidth
                  helperText={`Scale image to ${percentage}% of original size`}
                />
              )}
            </Stack>
          </Card>

          <ActionButtons
            onReset={reset}
            onProcess={resizeImage}
            onDownload={downloadImage}
            processing={processing}
            processed={!!resizedUrl}
          />
        </Stack>
      )}
    </ToolLayout>
  );
}
