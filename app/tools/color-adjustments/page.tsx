'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Slider, Box, Grid } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea, ActionButtons } from '@/components/ToolComponents';

export default function ColorAdjustmentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [adjustedUrl, setAdjustedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [hue, setHue] = useState<number>(0);
  const [exposure, setExposure] = useState<number>(0);
  const [highlights, setHighlights] = useState<number>(0);
  const [shadows, setShadows] = useState<number>(0);
  const [vibrance, setVibrance] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setAdjustedUrl(null);
    setError(null);
  };

  const adjustColors = async () => {
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

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Exposure
        const exposureFactor = Math.pow(2, exposure / 100);
        r *= exposureFactor;
        g *= exposureFactor;
        b *= exposureFactor;

        // Temperature (warm/cool)
        if (temperature > 0) {
          r += temperature * 2;
          b -= temperature;
        } else if (temperature < 0) {
          r += temperature;
          b -= temperature * 2;
        }

        // Highlights & Shadows
        const brightness = (r + g + b) / 3;
        if (brightness > 180) {
          const highlightFactor = 1 + (highlights / 100);
          r *= highlightFactor;
          g *= highlightFactor;
          b *= highlightFactor;
        } else if (brightness < 75) {
          const shadowFactor = 1 + (shadows / 100);
          r *= shadowFactor;
          g *= shadowFactor;
          b *= shadowFactor;
        }

        // Vibrance
        const avg = (r + g + b) / 3;
        const vibranceFactor = 1 + (vibrance / 100);
        r = avg + (r - avg) * vibranceFactor;
        g = avg + (g - avg) * vibranceFactor;
        b = avg + (b - avg) * vibranceFactor;

        // Hue shift
        if (hue !== 0) {
          const angle = (hue * Math.PI) / 180;
          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);
          const nr = r * cosA + g * sinA;
          const ng = r * -sinA + g * cosA;
          r = nr;
          g = ng;
        }

        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }

      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), file.type || 'image/png', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setAdjustedUrl(url);
    } catch (err) {
      setError('Color adjustment failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!adjustedUrl || !file) return;
    const a = document.createElement('a');
    a.href = adjustedUrl;
    a.download = file.name.replace(/(\.[^.]+)$/, '-adjusted$1');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setAdjustedUrl(null);
    setError(null);
    setHue(0);
    setExposure(0);
    setHighlights(0);
    setShadows(0);
    setVibrance(0);
    setTemperature(0);
  };

  return (
    <ToolLayout
      title="Color Adjustments"
      description="Professional color grading with hue, exposure, temperature, highlights, shadows, and vibrance"
      features={['Pro Controls', 'Real-time', 'HSL Adjustments', 'Temperature']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={adjustedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Exposure: {exposure > 0 ? '+' : ''}{exposure}
                    </Typography>
                    <Slider
                      value={exposure}
                      onChange={(e, val) => setExposure(val as number)}
                      min={-100}
                      max={100}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Temperature: {temperature > 0 ? 'Warm +' : temperature < 0 ? 'Cool ' : ''}{temperature}
                    </Typography>
                    <Slider
                      value={temperature}
                      onChange={(e, val) => setTemperature(val as number)}
                      min={-100}
                      max={100}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Highlights: {highlights > 0 ? '+' : ''}{highlights}
                    </Typography>
                    <Slider
                      value={highlights}
                      onChange={(e, val) => setHighlights(val as number)}
                      min={-100}
                      max={100}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Shadows: {shadows > 0 ? '+' : ''}{shadows}
                    </Typography>
                    <Slider
                      value={shadows}
                      onChange={(e, val) => setShadows(val as number)}
                      min={-100}
                      max={100}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Vibrance: {vibrance > 0 ? '+' : ''}{vibrance}
                    </Typography>
                    <Slider
                      value={vibrance}
                      onChange={(e, val) => setVibrance(val as number)}
                      min={-100}
                      max={100}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Hue Shift: {hue}°
                    </Typography>
                    <Slider
                      value={hue}
                      onChange={(e, val) => setHue(val as number)}
                      min={-180}
                      max={180}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </Card>

          <ActionButtons
            onReset={reset}
            onProcess={adjustColors}
            onDownload={downloadImage}
            processing={processing}
            processed={!!adjustedUrl}
          />
        </Stack>
      )}
    </ToolLayout>
  );
}
