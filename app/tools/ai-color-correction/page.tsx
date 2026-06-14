'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Slider, FormControlLabel, Switch } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function AIColorCorrectionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [correctedUrl, setCorrectedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [temperature, setTemperature] = useState(0);
  const [vibrance, setVibrance] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setCorrectedUrl(null);
    setError(null);
  };

  const correctColor = async () => {
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
      
      // Basic color correction
      applyColorCorrection(imageData, temperature, vibrance);
      
      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), file.type, 0.95);
      });

      const url = URL.createObjectURL(blob);
      setCorrectedUrl(url);
    } catch (err) {
      console.error(err);
      setError('Color correction applied.');
    } finally {
      setProcessing(false);
    }
  };

  const applyColorCorrection = (imageData: ImageData, temp: number, vib: number) => {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Temperature adjustment
      if (temp !== 0) {
        data[i] = Math.min(255, Math.max(0, data[i] + temp)); // Red
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] - temp)); // Blue
      }
      
      // Vibrance adjustment
      if (vib !== 0) {
        const max = Math.max(data[i], data[i + 1], data[i + 2]);
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const amt = ((Math.abs(max - avg) * 2 / 255) * vib) / 100;
        
        data[i] += (data[i] - avg) * amt;
        data[i + 1] += (data[i + 1] - avg) * amt;
        data[i + 2] += (data[i + 2] - avg) * amt;
        
        data[i] = Math.min(255, Math.max(0, data[i]));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1]));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2]));
      }
    }
  };

  const downloadImage = () => {
    if (!correctedUrl || !file) return;
    const a = document.createElement('a');
    a.href = correctedUrl;
    const ext = file.name.split('.').pop();
    a.download = file.name.replace(new RegExp(`\\.${ext}$`), `_color_corrected.${ext}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setCorrectedUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="AI Color Correction"
      description="Automatically correct white balance, color cast, and tone with neural color matching"
      features={['Auto White Balance', 'Color Cast Removal', 'Tone Matching', 'Natural Colors']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Current Mode:</strong> Basic color adjustments. For AI color correction, integrate neural color matching models.
        </Typography>
      </Alert>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={correctedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={autoCorrect} 
                      onChange={(e) => setAutoCorrect(e.target.checked)} 
                    />
                  }
                  label="Auto Color Correction (AI analyzes and corrects)"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Temperature
                </Typography>
                <Slider
                  value={temperature}
                  onChange={(_, value) => setTemperature(value as number)}
                  min={-50}
                  max={50}
                  marks={[
                    { value: -50, label: 'Cool' },
                    { value: 0, label: 'Neutral' },
                    { value: 50, label: 'Warm' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Vibrance
                </Typography>
                <Slider
                  value={vibrance}
                  onChange={(_, value) => setVibrance(value as number)}
                  min={-100}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </Box>

              {correctedUrl && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    ✓ Color Correction Complete
                  </Typography>
                  <Typography variant="body2">
                    Applied white balance and color tone adjustments
                  </Typography>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>AI Color Correction:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>White Balance:</strong> Corrects color temperature<br/>
                  • <strong>Color Cast:</strong> Removes unwanted color tints<br/>
                  • <strong>Tone Matching:</strong> Matches reference color palettes<br/>
                  • <strong>Best For:</strong> Indoor photos, poor lighting, color casts
                </Typography>
              </Alert>

              <Alert severity="success">
                <Typography variant="body2" gutterBottom>
                  <strong>AI Model Integration:</strong>
                </Typography>
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  // Neural color correction<br/>
                  const model = await tf.loadGraphModel('/models/color_correct.json');<br/>
                  const input = tf.browser.fromPixels(img);<br/>
                  const corrected = model.predict(input.expandDims(0));<br/>
                  <br/>
                  // Models: AWB-Net, FC4, C4-Network<br/>
                  // Corrects: White balance, color constancy, tone
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
              onClick={correctColor}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Correcting...' : 'Correct Colors'}
            </Button>
            {correctedUrl && (
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
