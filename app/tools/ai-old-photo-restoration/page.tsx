'use client';

import { useState, useRef } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Slider, FormControlLabel, Switch } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function AIPhotoRestorationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Restoration settings
  const [scratchRemoval, setScratchRemoval] = useState(70);
  const [dustRemoval, setDustRemoval] = useState(70);
  const [colorRestoration, setColorRestoration] = useState(60);
  const [contrastEnhancement, setContrastEnhancement] = useState(50);
  const [autoColorize, setAutoColorize] = useState(false);
  const [denoise, setDenoise] = useState(true);

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

  const restorePhoto = () => {
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

      // Draw original image
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply basic restoration algorithms
      let restoredData = imageData;

      // 1. Denoise
      if (denoise) {
        restoredData = applyDenoise(restoredData, dustRemoval / 100);
      }

      // 2. Scratch removal
      restoredData = applyScratchRemoval(restoredData, scratchRemoval / 100);

      // 3. Color restoration
      restoredData = applyColorRestoration(restoredData, colorRestoration / 100);

      // 4. Contrast enhancement
      restoredData = applyContrastEnhancement(restoredData, contrastEnhancement / 100);

      // 5. Auto-colorize (basic)
      if (autoColorize) {
        restoredData = applyBasicColorization(restoredData);
      }

      ctx.putImageData(restoredData, 0, 0);
      setProcessedUrl(canvas.toDataURL('image/png'));
      setProcessing(false);
    };
    img.src = originalUrl;
  };

  const applyDenoise = (imageData: ImageData, strength: number): ImageData => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    const original = imageData.data;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const values: number[] = [];
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const idx = ((y + dy) * width + (x + dx)) * 4 + c;
              values.push(original[idx]);
            }
          }
          values.sort((a, b) => a - b);
          const median = values[4];
          const idx = (y * width + x) * 4 + c;
          data[idx] = original[idx] * (1 - strength) + median * strength;
        }
      }
    }

    return new ImageData(data, width, height);
  };

  const applyScratchRemoval = (imageData: ImageData, strength: number): ImageData => {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    const original = imageData.data;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        const brightness = (original[idx] + original[idx + 1] + original[idx + 2]) / 3;
        const neighbors: number[] = [];
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            const nBrightness = (original[nIdx] + original[nIdx + 1] + original[nIdx + 2]) / 3;
            neighbors.push(nBrightness);
          }
        }
        
        const avgNeighbor = neighbors.reduce((a, b) => a + b, 0) / neighbors.length;
        const diff = Math.abs(brightness - avgNeighbor);
        
        if (diff > 50) {
          const factor = Math.min(1, diff / 100) * strength;
          for (let c = 0; c < 3; c++) {
            const neighborAvg = neighbors.reduce((sum, _, i) => {
              const nIdx = ((y + Math.floor(i / 3) - 1) * width + (x + (i % 3) - 1)) * 4 + c;
              return sum + original[nIdx];
            }, 0) / 8;
            data[idx + c] = original[idx + c] * (1 - factor) + neighborAvg * factor;
          }
        } else {
          for (let c = 0; c < 3; c++) {
            data[idx + c] = original[idx + c];
          }
        }
        data[idx + 3] = original[idx + 3];
      }
    }

    return new ImageData(data, width, height);
  };

  const applyColorRestoration = (imageData: ImageData, strength: number): ImageData => {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const avg = (r + g + b) / 3;

      const satFactor = 1 + strength * 0.5;
      data[i] = Math.min(255, avg + (r - avg) * satFactor);
      data[i + 1] = Math.min(255, avg + (g - avg) * satFactor);
      data[i + 2] = Math.min(255, avg + (b - avg) * satFactor);
    }

    return imageData;
  };

  const applyContrastEnhancement = (imageData: ImageData, strength: number): ImageData => {
    const data = imageData.data;
    const factor = 1 + strength * 0.8;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * factor + 128));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * factor + 128));
    }

    return imageData;
  };

  const applyBasicColorization = (imageData: ImageData): ImageData => {
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const colorDiff = Math.abs(data[i] - data[i + 1]) + Math.abs(data[i + 1] - data[i + 2]);
      
      if (colorDiff < 30) {
        data[i] = Math.min(255, gray * 1.1);
        data[i + 1] = Math.min(255, gray * 1.05);
        data[i + 2] = Math.min(255, gray * 0.95);
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
      title="AI Old Photo Restoration"
      description="Restore and enhance old or damaged photos with AI-powered algorithms"
      features={['Scratch Removal', 'Dust Removal', 'Color Restoration', 'Auto Colorization']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>AI Model Integration Available:</strong>
        </Typography>
        <Typography variant="caption" component="div">
          For production use, integrate AI models:<br/>
          • <strong>Bringing-Old-Photos-Back-to-Life</strong> - Microsoft's scratch detection<br/>
          • <strong>DeOldify</strong> - AI colorization for B&W photos<br/>
          • <strong>GFPGAN</strong> - Face restoration for portraits<br/>
          • <strong>Real-ESRGAN</strong> - Resolution enhancement<br/>
          <br/>
          Currently using basic canvas algorithms. Full AI integration guide below.
        </Typography>
      </Alert>

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={processedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6">Restoration Settings</Typography>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Scratch Removal: {scratchRemoval}%
                </Typography>
                <Slider
                  value={scratchRemoval}
                  onChange={(_, value) => setScratchRemoval(value as number)}
                  min={0}
                  max={100}
                  disabled={processing}
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Dust Removal: {dustRemoval}%
                </Typography>
                <Slider
                  value={dustRemoval}
                  onChange={(_, value) => setDustRemoval(value as number)}
                  min={0}
                  max={100}
                  disabled={processing}
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Color Restoration: {colorRestoration}%
                </Typography>
                <Slider
                  value={colorRestoration}
                  onChange={(_, value) => setColorRestoration(value as number)}
                  min={0}
                  max={100}
                  disabled={processing}
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Contrast Enhancement: {contrastEnhancement}%
                </Typography>
                <Slider
                  value={contrastEnhancement}
                  onChange={(_, value) => setContrastEnhancement(value as number)}
                  min={0}
                  max={100}
                  disabled={processing}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={denoise}
                    onChange={(e) => setDenoise(e.target.checked)}
                    disabled={processing}
                  />
                }
                label="Apply Denoising"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={autoColorize}
                    onChange={(e) => setAutoColorize(e.target.checked)}
                    disabled={processing}
                  />
                }
                label="Auto-Colorize (Basic - AI needed for best results)"
              />
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={restorePhoto}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Restoring...' : 'Restore Photo'}
            </Button>
          </Stack>
        </Stack>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </ToolLayout>
  );
}
