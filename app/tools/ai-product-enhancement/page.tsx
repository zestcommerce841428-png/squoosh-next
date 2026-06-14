'use client';

import { useState, useRef } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Slider, FormControlLabel, Switch, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

type BackgroundType = 'white' | 'transparent' | 'gradient' | 'original';

export default function AIProductEnhancementPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Enhancement settings
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('white');
  const [autoRemoveBackground, setAutoRemoveBackground] = useState(true);
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [saturation, setSaturation] = useState(50);
  const [sharpness, setSharpness] = useState(30);
  const [autoLighting, setAutoLighting] = useState(true);
  const [shadowRemoval, setShadowRemoval] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      return;
    }
    
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setProcessedUrl(null);
  };

  const enhanceProduct = () => {
    if (!file || !originalUrl) return;

    setProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setProcessing(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setProcessing(false);
        return;
      }

      // Apply background first
      applyBackground(ctx, canvas.width, canvas.height, backgroundType);

      // Draw original image
      ctx.drawImage(img, 0, 0);
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply enhancements
      if (shadowRemoval) {
        imageData = applyShadowRemoval(imageData);
      }

      if (autoLighting) {
        imageData = applyAutoLighting(imageData);
      }

      imageData = applyBrightnessContrast(imageData, brightness, contrast);
      imageData = applySaturation(imageData, saturation);
      
      if (sharpness > 0) {
        imageData = applySharpness(imageData, sharpness);
      }

      // Simple background removal
      if (autoRemoveBackground && backgroundType !== 'original') {
        imageData = applyBasicBackgroundRemoval(imageData);
      }

      ctx.putImageData(imageData, 0, 0);
      
      // Apply final background composite
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const finalCtx = finalCanvas.getContext('2d');
      if (finalCtx) {
        applyBackground(finalCtx, finalCanvas.width, finalCanvas.height, backgroundType);
        finalCtx.drawImage(canvas, 0, 0);
        setProcessedUrl(finalCanvas.toDataURL('image/png'));
      }
      
      setProcessing(false);
    };
    img.src = originalUrl;
  };

  const applyBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, type: BackgroundType) => {
    if (type === 'white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    } else if (type === 'transparent') {
      ctx.clearRect(0, 0, width, height);
    } else if (type === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#F5F5F5');
      gradient.addColorStop(1, '#E0E0E0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
  };

  const applyBrightnessContrast = (imageData: ImageData, bright: number, cont: number): ImageData => {
    const data = imageData.data;
    const brightFactor = (bright - 50) * 2.55;
    const contrastFactor = (cont / 50);

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrastFactor + 128 + brightFactor));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrastFactor + 128 + brightFactor));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrastFactor + 128 + brightFactor));
    }

    return imageData;
  };

  const applySaturation = (imageData: ImageData, sat: number): ImageData => {
    const data = imageData.data;
    const satFactor = (sat - 50) / 50;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;

      data[i] = Math.min(255, Math.max(0, gray + (r - gray) * (1 + satFactor)));
      data[i + 1] = Math.min(255, Math.max(0, gray + (g - gray) * (1 + satFactor)));
      data[i + 2] = Math.min(255, Math.max(0, gray + (b - gray) * (1 + satFactor)));
    }

    return imageData;
  };

  const applySharpness = (imageData: ImageData, amount: number): ImageData => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    const original = imageData.data;
    const factor = amount / 100;

    const kernel = [
      0, -factor, 0,
      -factor, 1 + 4 * factor, -factor,
      0, -factor, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          sum += original[((y - 1) * width + x) * 4 + c] * kernel[1];
          sum += original[(y * width + (x - 1)) * 4 + c] * kernel[3];
          sum += original[(y * width + x) * 4 + c] * kernel[4];
          sum += original[(y * width + (x + 1)) * 4 + c] * kernel[5];
          sum += original[((y + 1) * width + x) * 4 + c] * kernel[7];
          
          const idx = (y * width + x) * 4 + c;
          data[idx] = Math.min(255, Math.max(0, sum));
        }
      }
    }

    return new ImageData(data, width, height);
  };

  const applyShadowRemoval = (imageData: ImageData): ImageData => {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const factor = 1 + (1 - brightness / 255) * 0.3;

      data[i] = Math.min(255, data[i] * factor);
      data[i + 1] = Math.min(255, data[i + 1] * factor);
      data[i + 2] = Math.min(255, data[i + 2] * factor);
    }

    return imageData;
  };

  const applyAutoLighting = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    
    let totalBrightness = 0;
    let count = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += brightness;
      count++;
    }
    
    const avgBrightness = totalBrightness / count;
    const targetBrightness = 140;
    const adjustment = (targetBrightness - avgBrightness) / 2;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + adjustment));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment));
    }

    return imageData;
  };

  const applyBasicBackgroundRemoval = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const cornerSamples = [
      [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]
    ];
    
    const bgColors: number[][] = [];
    cornerSamples.forEach(([x, y]) => {
      const idx = (y * width + x) * 4;
      bgColors.push([data[idx], data[idx + 1], data[idx + 2]]);
    });

    const avgBg = [
      bgColors.reduce((sum, c) => sum + c[0], 0) / bgColors.length,
      bgColors.reduce((sum, c) => sum + c[1], 0) / bgColors.length,
      bgColors.reduce((sum, c) => sum + c[2], 0) / bgColors.length
    ];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const diff = Math.sqrt(
        Math.pow(r - avgBg[0], 2) +
        Math.pow(g - avgBg[1], 2) +
        Math.pow(b - avgBg[2], 2)
      );

      if (diff < 60) {
        data[i + 3] = 0;
      }
    }

    return imageData;
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
  };

  return (
    <ToolLayout
      title="AI Product Enhancement"
      description="Enhance product photos for e-commerce with professional AI-powered tools"
      features={['Background Removal', 'Auto Lighting', 'Shadow Removal', 'Quality Enhancement']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>AI Model Integration Available:</strong>
        </Typography>
        <Typography variant="caption" component="div">
          For production-grade results, integrate AI models:<br/>
          • <strong>U²-Net / MODNet</strong> - Accurate background removal<br/>
          • <strong>DeepLab v3+</strong> - Semantic segmentation<br/>
          • <strong>Zero-DCE++</strong> - Low-light enhancement<br/>
          • <strong>Real-ESRGAN</strong> - Quality upscaling<br/>
          <br/>
          Currently using canvas algorithms. See implementation guide below.
        </Typography>
      </Alert>

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={processedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Enhancement Settings</Typography>

              <FormControl fullWidth>
                <InputLabel>Background</InputLabel>
                <Select
                  value={backgroundType}
                  onChange={(e) => setBackgroundType(e.target.value as BackgroundType)}
                  label="Background"
                  disabled={processing}
                >
                  <MenuItem value="white">White Background</MenuItem>
                  <MenuItem value="transparent">Transparent (PNG)</MenuItem>
                  <MenuItem value="gradient">Gradient Background</MenuItem>
                  <MenuItem value="original">Keep Original</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={autoRemoveBackground}
                    onChange={(e) => setAutoRemoveBackground(e.target.checked)}
                    disabled={processing || backgroundType === 'original'}
                  />
                }
                label="Auto Remove Background (Basic - AI needed for best results)"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={autoLighting}
                    onChange={(e) => setAutoLighting(e.target.checked)}
                    disabled={processing}
                  />
                }
                label="Auto Lighting Correction"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={shadowRemoval}
                    onChange={(e) => setShadowRemoval(e.target.checked)}
                    disabled={processing}
                  />
                }
                label="Shadow Removal"
              />

              <Box>
                <Typography variant="body2" gutterBottom>
                  Brightness: {brightness}%
                </Typography>
                <Slider
                  value={brightness}
                  onChange={(_, value) => setBrightness(value as number)}
                  min={0}
                  max={100}
                  disabled={processing}
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Contrast: {contrast}%
                </Typography>
                <Slider
                  value={contrast}
                  onChange={(_, value) => setContrast(value as number)}
                  min={0}
                  max={100}
                  disabled={processing}
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Saturation: {saturation}%
                </Typography>
                <Slider
                  value={saturation}
                  onChange={(_, value) => setSaturation(value as number)}
                  min={0}
                  max={100}
                  disabled={processing}
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Sharpness: {sharpness}%
                </Typography>
                <Slider
                  value={sharpness}
                  onChange={(_, value) => setSharpness(value as number)}
                  min={0}
                  max={100}
                  disabled={processing}
                />
              </Box>
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={enhanceProduct}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Enhancing...' : 'Enhance Product Photo'}
            </Button>
          </Stack>
        </Stack>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </ToolLayout>
  );
}
