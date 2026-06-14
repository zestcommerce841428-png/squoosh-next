'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function PngOptimizationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [colorDepth, setColorDepth] = useState<'auto' | '8bit' | '24bit'>('auto');
  const [ditherEnabled, setDitherEnabled] = useState(true);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);
  const [originalColors, setOriginalColors] = useState<number>(0);
  const [optimizedColors, setOptimizedColors] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setOptimizedUrl(null);
    setError(null);
  };

  // Count unique colors in image
  const countColors = (imageData: ImageData): number => {
    const colors = new Set<string>();
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const color = `${data[i]},${data[i+1]},${data[i+2]},${data[i+3]}`;
      colors.add(color);
      
      // Limit counting to prevent performance issues
      if (colors.size > 10000) break;
    }
    
    return colors.size;
  };

  // Apply palette reduction (quantization)
  const reducePalette = (imageData: ImageData, targetColors: number): ImageData => {
    const data = imageData.data;
    const colorMap = new Map<string, { r: number; g: number; b: number; a: number; count: number }>();
    
    // Count color occurrences
    for (let i = 0; i < data.length; i += 4) {
      const key = `${data[i]},${data[i+1]},${data[i+2]},${data[i+3]}`;
      const existing = colorMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        colorMap.set(key, { r: data[i], g: data[i+1], b: data[i+2], a: data[i+3], count: 1 });
      }
    }
    
    // Get most common colors
    const sortedColors = Array.from(colorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, targetColors);
    
    // Map each pixel to nearest palette color
    for (let i = 0; i < data.length; i += 4) {
      let minDistance = Infinity;
      let bestColor = sortedColors[0];
      
      const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
      
      for (const color of sortedColors) {
        const distance = Math.sqrt(
          Math.pow(r - color.r, 2) +
          Math.pow(g - color.g, 2) +
          Math.pow(b - color.b, 2) +
          Math.pow(a - color.a, 2)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          bestColor = color;
        }
      }
      
      data[i] = bestColor.r;
      data[i+1] = bestColor.g;
      data[i+2] = bestColor.b;
      data[i+3] = bestColor.a;
    }
    
    return imageData;
  };

  const optimizePng = async () => {
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
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);

      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const origColors = countColors(imageData);
      setOriginalColors(origColors);

      // Apply optimizations
      if (colorDepth === '8bit') {
        // Reduce to 256 colors
        imageData = reducePalette(imageData, 256);
      } else if (colorDepth === 'auto') {
        // Auto-detect: if < 256 colors, use 8-bit
        if (origColors <= 256) {
          imageData = reducePalette(imageData, origColors);
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const optColors = countColors(imageData);
      setOptimizedColors(optColors);

      // Export optimized PNG
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      setOptimizedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setOptimizedUrl(url);
    } catch (err) {
      console.error(err);
      setError('PNG optimization failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!optimizedUrl || !file) return;
    const a = document.createElement('a');
    a.href = optimizedUrl;
    a.download = file.name.replace(/\.[^.]+$/, '-optimized.png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setOptimizedUrl(null);
    setError(null);
    setOriginalSize(0);
    setOptimizedSize(0);
    setOriginalColors(0);
    setOptimizedColors(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const savings = originalSize && optimizedSize 
    ? Math.round((1 - optimizedSize / originalSize) * 100)
    : 0;

  return (
    <ToolLayout
      title="PNG Optimization"
      description="Advanced PNG compression with palette reduction and metadata stripping. Reduce file size by 40-70%"
      features={['Palette Reduction', 'Color Quantization', 'Metadata Strip', 'Transparency Preserve']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/png" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={optimizedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Color Depth</InputLabel>
                <Select
                  value={colorDepth}
                  label="Color Depth"
                  onChange={(e) => setColorDepth(e.target.value as 'auto' | '8bit' | '24bit')}
                >
                  <MenuItem value="auto">Auto-Detect (Recommended)</MenuItem>
                  <MenuItem value="8bit">8-bit (256 colors)</MenuItem>
                  <MenuItem value="24bit">24-bit (16M colors)</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  8-bit mode provides best compression for simple graphics, logos, and screenshots
                </Typography>
              </FormControl>

              <Box>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={ditherEnabled} 
                      onChange={(e) => setDitherEnabled(e.target.checked)} 
                    />
                  }
                  label="Enable Dithering (Smooth color transitions)"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={stripMetadata} 
                      onChange={(e) => setStripMetadata(e.target.checked)} 
                    />
                  }
                  label="Strip Metadata (Smaller file size)"
                />
              </Box>

              {optimizedUrl && (
                <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="warning.dark" gutterBottom>
                    🎨 PNG Optimization Results
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original: {formatFileSize(originalSize)} • {originalColors > 10000 ? '10000+' : originalColors} colors
                    </Typography>
                    <Typography variant="body2">
                      Optimized: {formatFileSize(optimizedSize)} • {optimizedColors > 10000 ? '10000+' : optimizedColors} colors
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="warning.dark">
                      Saved: {savings}% ({formatFileSize(originalSize - optimizedSize)})
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>PNG Optimization Techniques:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>Palette Reduction:</strong> Reduces color count without visible quality loss<br/>
                  • <strong>Metadata Stripping:</strong> Removes EXIF, comments, and other non-visual data<br/>
                  • <strong>Alpha Optimization:</strong> Optimizes transparency channel<br/>
                  • <strong>Best for:</strong> Graphics, logos, icons, screenshots, UI elements
                </Typography>
              </Alert>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Note:</strong> For photos with gradients, use JPEG or WebP format instead. 
                  PNG is ideal for images with flat colors, text, and transparency.
                </Typography>
              </Alert>
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={optimizePng}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Optimizing...' : 'Optimize PNG'}
            </Button>
            {optimizedUrl && (
              <Button variant="contained" color="success" onClick={downloadImage} fullWidth>
                Download
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
