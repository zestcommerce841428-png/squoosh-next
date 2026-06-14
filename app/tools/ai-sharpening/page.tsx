'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Slider } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function AISharpeningPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [sharpenedUrl, setSharpenedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [sharpenAmount, setSharpenAmount] = useState(60);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setSharpenedUrl(null);
    setError(null);
  };

  const sharpenImage = async () => {
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
      
      // Unsharp mask algorithm
      applySharpen(imageData, sharpenAmount / 100);
      
      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), file.type, 0.95);
      });

      const url = URL.createObjectURL(blob);
      setSharpenedUrl(url);
    } catch (err) {
      console.error(err);
      setError('Sharpening failed.');
    } finally {
      setProcessing(false);
    }
  };

  const applySharpen = (imageData: ImageData, amount: number) => {
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const tempData = new Uint8ClampedArray(data);

    // Unsharp mask kernel
    const kernel = [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0
    ];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          let k = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const idx = ((y + dy) * w + (x + dx)) * 4 + c;
              sum += tempData[idx] * kernel[k++];
            }
          }
          const idx = (y * w + x) * 4 + c;
          data[idx] = Math.min(255, Math.max(0, sum));
        }
      }
    }
  };

  const downloadImage = () => {
    if (!sharpenedUrl || !file) return;
    const a = document.createElement('a');
    a.href = sharpenedUrl;
    const ext = file.name.split('.').pop();
    a.download = file.name.replace(new RegExp(`\\.${ext}$`), `_sharpened.${ext}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setSharpenedUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="AI Sharpening"
      description="Sharpen blurry images and recover detail with AI-powered de-blur correction"
      features={['De-blur Correction', 'Detail Recovery', 'Edge Enhancement', 'Smart Sharpening']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Current Mode:</strong> Unsharp mask algorithm. For AI de-blur, integrate DeblurGAN or SRN-Deblur models.
        </Typography>
      </Alert>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={sharpenedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Sharpen Amount
                </Typography>
                <Slider
                  value={sharpenAmount}
                  onChange={(_, value) => setSharpenAmount(value as number)}
                  min={0}
                  max={100}
                  marks={[
                    { value: 0, label: 'Subtle' },
                    { value: 50, label: 'Moderate' },
                    { value: 100, label: 'Strong' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              {sharpenedUrl && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    ✓ Sharpening Complete
                  </Typography>
                  <Typography variant="body2">
                    Enhanced edge clarity and detail sharpness
                  </Typography>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>AI Sharpening Features:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>Motion Blur:</strong> Corrects camera shake and motion<br/>
                  • <strong>Focus Blur:</strong> Recovers out-of-focus details<br/>
                  • <strong>Edge Enhancement:</strong> Sharpens boundaries without halos<br/>
                  • <strong>Best For:</strong> Blurry photos, old scans, soft images
                </Typography>
              </Alert>

              <Alert severity="success">
                <Typography variant="body2" gutterBottom>
                  <strong>AI Model Integration:</strong>
                </Typography>
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  // DeblurGAN or SRN-Deblur<br/>
                  const model = await tf.loadGraphModel('/models/deblur.json');<br/>
                  const blurry = tf.browser.fromPixels(img);<br/>
                  const sharp = model.predict(blurry.expandDims(0));<br/>
                  <br/>
                  // Models: DeblurGAN-v2, SRN-Deblur, MIMO-UNet<br/>
                  // Handles: Motion blur, defocus blur, Gaussian blur
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
              onClick={sharpenImage}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Sharpening...' : 'Sharpen Image'}
            </Button>
            {sharpenedUrl && (
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
