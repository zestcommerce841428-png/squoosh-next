'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

type UpscaleFactor = '2x' | '4x';

export default function AIUpscalerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [upscaleFactor, setUpscaleFactor] = useState<UpscaleFactor>('2x');
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setUpscaledUrl(null);
    setError(null);

    const img = new Image();
    img.src = url;
    await new Promise((resolve) => { img.onload = resolve; });
    setOriginalDimensions({ width: img.width, height: img.height });
  };

  const upscaleImage = async () => {
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

      const factor = upscaleFactor === '2x' ? 2 : 4;
      const canvas = document.createElement('canvas');
      canvas.width = img.width * factor;
      canvas.height = img.height * factor;
      const ctx = canvas.getContext('2d')!;
      
      // High-quality bicubic interpolation (basic upscaling)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Note: For AI super-resolution, use ESRGAN, Real-ESRGAN, or Waifu2x models
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), file.type, 0.95);
      });

      const url = URL.createObjectURL(blob);
      setUpscaledUrl(url);
    } catch (err) {
      console.error(err);
      setError('Upscaling failed. For AI super-resolution, integrate Real-ESRGAN or Waifu2x model.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!upscaledUrl || !file) return;
    const a = document.createElement('a');
    a.href = upscaledUrl;
    const ext = file.name.split('.').pop();
    a.download = file.name.replace(new RegExp(`\\.${ext}$`), `_upscaled_${upscaleFactor}.${ext}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setUpscaledUrl(null);
    setError(null);
    setOriginalDimensions({ width: 0, height: 0 });
  };

  const newDimensions = {
    width: originalDimensions.width * (upscaleFactor === '2x' ? 2 : 4),
    height: originalDimensions.height * (upscaleFactor === '2x' ? 2 : 4),
  };

  return (
    <ToolLayout
      title="AI Upscaler"
      description="Upscale images 2x or 4x with AI super-resolution for sharp, detailed results"
      features={['2x/4x Upscaling', 'Super Resolution', 'Detail Recovery', 'AI Enhancement']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Current Mode:</strong> Bicubic interpolation
        </Typography>
        <Typography variant="caption">
          For AI super-resolution, integrate Real-ESRGAN, ESRGAN, or Waifu2x models via TensorFlow.js
        </Typography>
      </Alert>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={upscaledUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>Upscale Factor</InputLabel>
                  <Select
                    value={upscaleFactor}
                    label="Upscale Factor"
                    onChange={(e) => setUpscaleFactor(e.target.value as UpscaleFactor)}
                  >
                    <MenuItem value="2x">2x (Double Resolution)</MenuItem>
                    <MenuItem value="4x">4x (Quadruple Resolution)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Resolution Preview
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    Original: {originalDimensions.width} × {originalDimensions.height}px
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Upscaled ({upscaleFactor}): {newDimensions.width} × {newDimensions.height}px
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total pixels: {(originalDimensions.width * originalDimensions.height / 1000000).toFixed(1)}MP → {(newDimensions.width * newDimensions.height / 1000000).toFixed(1)}MP
                  </Typography>
                </Stack>
              </Box>

              {upscaledUrl && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    ✓ Upscaling Complete
                  </Typography>
                  <Typography variant="body2">
                    Resolution increased {upscaleFactor} using high-quality interpolation
                  </Typography>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>AI Super-Resolution:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>2x Upscale:</strong> Best for general photos and web images<br/>
                  • <strong>4x Upscale:</strong> For low-resolution to high-resolution conversion<br/>
                  • <strong>AI Models:</strong> Recover lost details and enhance sharpness<br/>
                  • <strong>Use Cases:</strong> Print enlargement, old photos, low-res images
                </Typography>
              </Alert>

              <Alert severity="success">
                <Typography variant="body2" gutterBottom>
                  <strong>AI Model Integration:</strong>
                </Typography>
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  // Real-ESRGAN (state-of-the-art)<br/>
                  npm install @tensorflow/tfjs<br/>
                  <br/>
                  const model = await tf.loadGraphModel('/models/realesrgan.json');<br/>
                  const input = tf.browser.fromPixels(img);<br/>
                  const upscaled = model.predict(input.expandDims(0));<br/>
                  <br/>
                  // Models: Real-ESRGAN, ESRGAN, Waifu2x, SRGAN<br/>
                  // Size: 5-50MB depending on model
                </Typography>
              </Alert>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Note:</strong> AI super-resolution models require significant GPU resources. 
                  WebGL acceleration is essential for acceptable performance. Models typically range from 
                  5-50MB and process time depends on image size and device capabilities.
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
              onClick={upscaleImage}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Upscaling...' : `Upscale ${upscaleFactor}`}
            </Button>
            {upscaledUrl && (
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
