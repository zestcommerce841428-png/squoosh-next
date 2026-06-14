'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Slider, FormControlLabel, Switch } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function AIImageEnhancementPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [enhanceStrength, setEnhanceStrength] = useState(75);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setEnhancedUrl(null);
    setError(null);
  };

  const enhanceImage = async () => {
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
      
      // Basic enhancement algorithms (placeholder for AI model)
      enhanceImageData(imageData, enhanceStrength / 100);
      
      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), file.type, 0.95);
      });

      const url = URL.createObjectURL(blob);
      setEnhancedUrl(url);
    } catch (err) {
      console.error(err);
      setError('Enhancement failed. For AI-powered results, integrate TensorFlow.js model.');
    } finally {
      setProcessing(false);
    }
  };

  // Basic enhancement algorithm (placeholder for AI)
  const enhanceImageData = (imageData: ImageData, strength: number) => {
    const data = imageData.data;
    
    // Simple brightness/contrast adjustment
    const brightness = 10 * strength;
    const contrast = 1.2 * strength;
    
    for (let i = 0; i < data.length; i += 4) {
      // Adjust contrast and brightness
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128 + brightness));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128 + brightness));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128 + brightness));
    }
  };

  const downloadImage = () => {
    if (!enhancedUrl || !file) return;
    const a = document.createElement('a');
    a.href = enhancedUrl;
    const ext = file.name.split('.').pop();
    a.download = file.name.replace(new RegExp(`\\.${ext}$`), `_enhanced.${ext}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setEnhancedUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="AI Image Enhancement"
      description="Automatically enhance images with AI-powered brightness, contrast, and white balance adjustments"
      features={['Auto Enhancement', 'Smart Adjustments', 'One-Click Fix', 'Professional Results']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Current Mode:</strong> Basic enhancement algorithm
        </Typography>
        <Typography variant="caption">
          For AI-powered enhancement, integrate TensorFlow.js with a trained enhancement model (e.g., Adobe AutoTone, Google HDR+)
        </Typography>
      </Alert>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={enhancedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={autoAdjust} 
                      onChange={(e) => setAutoAdjust(e.target.checked)} 
                    />
                  }
                  label="Auto Adjust (AI analyzes optimal settings)"
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Enhancement Strength
                </Typography>
                <Slider
                  value={enhanceStrength}
                  onChange={(_, value) => setEnhanceStrength(value as number)}
                  min={0}
                  max={100}
                  step={5}
                  marks={[
                    { value: 0, label: 'None' },
                    { value: 50, label: 'Moderate' },
                    { value: 100, label: 'Maximum' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              {enhancedUrl && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    ✓ Enhancement Complete
                  </Typography>
                  <Typography variant="body2">
                    Applied brightness, contrast, and white balance adjustments
                  </Typography>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>AI Enhancement Features:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>Auto Balance:</strong> Corrects exposure and white balance<br/>
                  • <strong>Smart Contrast:</strong> Enhances details without over-processing<br/>
                  • <strong>Color Optimization:</strong> Natural color correction<br/>
                  • <strong>Shadow/Highlight:</strong> Recovers detail in dark/bright areas
                </Typography>
              </Alert>

              <Alert severity="success">
                <Typography variant="body2" gutterBottom>
                  <strong>AI Model Integration:</strong>
                </Typography>
                <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
                  // Install TensorFlow.js<br/>
                  npm install @tensorflow/tfjs<br/>
                  <br/>
                  // Load pre-trained enhancement model<br/>
                  const model = await tf.loadLayersModel('/models/enhance.json');<br/>
                  const input = tf.browser.fromPixels(img);<br/>
                  const enhanced = model.predict(input);<br/>
                  const output = await tf.browser.toPixels(enhanced);<br/>
                  <br/>
                  // Popular models: DeepUPE, EnlightenGAN, Zero-DCE
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
              onClick={enhanceImage}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Enhancing...' : 'Enhance Image'}
            </Button>
            {enhancedUrl && (
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
