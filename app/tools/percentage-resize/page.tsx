'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Slider, FormControlLabel, Checkbox } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function PercentageResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [percentage, setPercentage] = useState(50);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [newDimensions, setNewDimensions] = useState({ width: 0, height: 0 });
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [resizedSize, setResizedSize] = useState<number>(0);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setResizedUrl(null);
    setError(null);

    // Get original dimensions
    const img = new Image();
    img.src = url;
    await new Promise((resolve) => { img.onload = resolve; });
    setOriginalDimensions({ width: img.width, height: img.height });
    
    // Calculate new dimensions
    const scale = percentage / 100;
    setNewDimensions({
      width: Math.round(img.width * scale),
      height: Math.round(img.height * scale)
    });
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

      const scale = percentage / 100;
      const newWidth = Math.round(img.width * scale);
      const newHeight = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      const ctx = canvas.getContext('2d')!;
      
      // Use high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob (preserve original format if possible)
      const mimeType = file.type;
      const quality = mimeType === 'image/jpeg' ? 0.92 : undefined;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), mimeType, quality);
      });

      setResizedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setResizedUrl(url);
      setNewDimensions({ width: newWidth, height: newHeight });
    } catch (err) {
      console.error(err);
      setError('Resize failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resizedUrl || !file) return;
    const a = document.createElement('a');
    a.href = resizedUrl;
    const ext = file.name.split('.').pop();
    a.download = file.name.replace(new RegExp(`\\.${ext}$`), `_${percentage}percent.${ext}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setResizedUrl(null);
    setError(null);
    setOriginalSize(0);
    setResizedSize(0);
    setOriginalDimensions({ width: 0, height: 0 });
    setNewDimensions({ width: 0, height: 0 });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const sizeDiff = originalSize && resizedSize 
    ? Math.round((1 - resizedSize / originalSize) * 100)
    : 0;

  return (
    <ToolLayout
      title="Percentage Resize"
      description="Scale images by percentage with quick preset buttons for common resize operations"
      features={['Quick Scale Presets', 'Smooth Scaling', 'Aspect Ratio Lock', 'File Size Reduction']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={resizedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Resize Percentage
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Scale: {percentage}%
                </Typography>
                <Slider
                  value={percentage}
                  onChange={(_, value) => {
                    setPercentage(value as number);
                    const scale = (value as number) / 100;
                    setNewDimensions({
                      width: Math.round(originalDimensions.width * scale),
                      height: Math.round(originalDimensions.height * scale)
                    });
                  }}
                  min={10}
                  max={200}
                  step={5}
                  marks={[
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' },
                    { value: 150, label: '150%' },
                    { value: 200, label: '200%' },
                  ]}
                  valueLabelDisplay="auto"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
                  <Button size="small" variant="outlined" onClick={() => {
                    setPercentage(25);
                    const scale = 0.25;
                    setNewDimensions({
                      width: Math.round(originalDimensions.width * scale),
                      height: Math.round(originalDimensions.height * scale)
                    });
                  }}>
                    25% (Thumbnail)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => {
                    setPercentage(50);
                    const scale = 0.5;
                    setNewDimensions({
                      width: Math.round(originalDimensions.width * scale),
                      height: Math.round(originalDimensions.height * scale)
                    });
                  }}>
                    50% (Half Size)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => {
                    setPercentage(75);
                    const scale = 0.75;
                    setNewDimensions({
                      width: Math.round(originalDimensions.width * scale),
                      height: Math.round(originalDimensions.height * scale)
                    });
                  }}>
                    75% (Reduce)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => {
                    setPercentage(150);
                    const scale = 1.5;
                    setNewDimensions({
                      width: Math.round(originalDimensions.width * scale),
                      height: Math.round(originalDimensions.height * scale)
                    });
                  }}>
                    150% (Enlarge)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => {
                    setPercentage(200);
                    const scale = 2.0;
                    setNewDimensions({
                      width: Math.round(originalDimensions.width * scale),
                      height: Math.round(originalDimensions.height * scale)
                    });
                  }}>
                    200% (Double)
                  </Button>
                </Stack>
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={maintainAspectRatio} 
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)} 
                    />
                  }
                  label="Maintain Aspect Ratio (Locked)"
                />
              </Box>

              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Dimensions Preview
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    Original: {originalDimensions.width} × {originalDimensions.height}px
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    New: {newDimensions.width} × {newDimensions.height}px
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Scale factor: {percentage}% ({percentage < 100 ? 'downscale' : percentage > 100 ? 'upscale' : 'original size'})
                  </Typography>
                </Stack>
              </Box>

              {resizedUrl && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    ✓ Resize Complete
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original: {formatFileSize(originalSize)} ({originalDimensions.width}×{originalDimensions.height}px)
                    </Typography>
                    <Typography variant="body2">
                      Resized: {formatFileSize(resizedSize)} ({newDimensions.width}×{newDimensions.height}px)
                    </Typography>
                    {sizeDiff > 0 && (
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                        File size reduced by {sizeDiff}%
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>Percentage Resize Tips:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>25-50%:</strong> Ideal for thumbnails and previews<br/>
                  • <strong>75%:</strong> Reduce file size while maintaining quality<br/>
                  • <strong>150-200%:</strong> Enlarge for printing (may reduce quality)<br/>
                  • <strong>Downscaling:</strong> Always produces good results<br/>
                  • <strong>Upscaling:</strong> Limited by original resolution
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
              onClick={resizeImage}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Resizing...' : `Resize to ${percentage}%`}
            </Button>
            {resizedUrl && (
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
