'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Chip } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

export default function ColorPalettePage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setColors([]);
    setError(null);
  };

  const extractColors = async () => {
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

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Sample colors
      const colorMap = new Map<string, number>();
      
      for (let i = 0; i < data.length; i += 40) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }

      // Get top 10 colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([color]) => color);

      setColors(sortedColors);
    } catch (err) {
      setError('Color extraction failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setColors([]);
    setError(null);
  };

  return (
    <ToolLayout
      title="Color Palette Extractor"
      description="Extract color palettes from images with hex codes and RGB values"
      features={['Auto Extract', 'Top Colors', 'Copy Codes', 'Export Palette']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {originalUrl && (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Original" style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain' }} />
            </Card>
          )}

          {colors.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Extracted Palette ({colors.length} colors)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {colors.map((color, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: color,
                        borderRadius: 1,
                        border: '2px solid',
                        borderColor: 'divider'
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{color}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Color {i + 1}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => copyColor(color)}
                    >
                      Copy
                    </Button>
                  </Box>
                ))}
              </Box>
            </Card>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {colors.length === 0 ? (
              <Button
                variant="contained"
                onClick={extractColors}
                disabled={processing}
                fullWidth
              >
                {processing ? 'Extracting...' : 'Extract Colors'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  const paletteText = colors.join('\n');
                  navigator.clipboard.writeText(paletteText);
                }}
                fullWidth
              >
                Copy All Colors
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
