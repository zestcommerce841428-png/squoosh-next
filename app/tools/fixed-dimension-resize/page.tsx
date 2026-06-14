'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function FixedDimensionResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [fitMode, setFitMode] = useState<'cover' | 'contain' | 'fill'>('contain');
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
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

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d')!;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Calculate dimensions based on fit mode
      let drawWidth = targetWidth;
      let drawHeight = targetHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (fitMode === 'contain' && maintainAspectRatio) {
        // Fit entire image within bounds
        const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
        drawWidth = img.width * scale;
        drawHeight = img.height * scale;
        offsetX = (targetWidth - drawWidth) / 2;
        offsetY = (targetHeight - drawHeight) / 2;
        
        // Fill with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
      } else if (fitMode === 'cover' && maintainAspectRatio) {
        // Fill entire canvas, crop if needed
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        drawWidth = img.width * scale;
        drawHeight = img.height * scale;
        offsetX = (targetWidth - drawWidth) / 2;
        offsetY = (targetHeight - drawHeight) / 2;
      }
      // For 'fill' mode, use targetWidth and targetHeight directly (stretches)
      
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      const mimeType = file.type;
      const quality = mimeType === 'image/jpeg' ? 0.92 : undefined;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), mimeType, quality);
      });

      setResizedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setResizedUrl(url);
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
    a.download = file.name.replace(new RegExp(`\\.${ext}$`), `_${targetWidth}x${targetHeight}.${ext}`);
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
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <ToolLayout
      title="Fixed Dimension Resize"
      description="Resize images to exact pixel dimensions with contain, cover, or fill modes"
      features={['Exact Dimensions', 'Contain/Cover/Fill', 'Aspect Ratio Control', 'Common Presets']}
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
                  Target Dimensions
                </Typography>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Width (px)"
                    type="number"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(Math.max(1, parseInt(e.target.value) || 0))}
                    fullWidth
                  />
                  <TextField
                    label="Height (px)"
                    type="number"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(Math.max(1, parseInt(e.target.value) || 0))}
                    fullWidth
                  />
                </Stack>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Quick Presets:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                  <Button size="small" variant="outlined" onClick={() => { setTargetWidth(1920); setTargetHeight(1080); }}>
                    Full HD (1920×1080)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => { setTargetWidth(1280); setTargetHeight(720); }}>
                    HD (1280×720)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => { setTargetWidth(800); setTargetHeight(600); }}>
                    SVGA (800×600)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => { setTargetWidth(1024); setTargetHeight(768); }}>
                    XGA (1024×768)
                  </Button>
                </Stack>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Fit Mode</InputLabel>
                  <Select
                    value={fitMode}
                    label="Fit Mode"
                    onChange={(e) => setFitMode(e.target.value as 'cover' | 'contain' | 'fill')}
                  >
                    <MenuItem value="contain">Contain (fit within, add padding)</MenuItem>
                    <MenuItem value="cover">Cover (fill canvas, crop edges)</MenuItem>
                    <MenuItem value="fill">Fill (stretch to exact size)</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {fitMode === 'contain' && 'Image fits within bounds, white padding added if needed'}
                  {fitMode === 'cover' && 'Image fills entire canvas, edges may be cropped'}
                  {fitMode === 'fill' && 'Image stretched to exact dimensions (may distort)'}
                </Typography>
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={maintainAspectRatio} 
                      onChange={(e) => setMaintainAspectRatio(e.target.checked)} 
                    />
                  }
                  label="Maintain Aspect Ratio"
                />
              </Box>

              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Dimensions Info
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    Original: {originalDimensions.width} × {originalDimensions.height}px
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Target: {targetWidth} × {targetHeight}px
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
                      Original: {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2">
                      Resized: {formatFileSize(resizedSize)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      New dimensions: {targetWidth} × {targetHeight}px
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>Fixed Dimension Tips:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>Contain:</strong> Best for thumbnails, ensures full image visible<br/>
                  • <strong>Cover:</strong> Best for banners, fills entire space<br/>
                  • <strong>Fill:</strong> Exact dimensions, may distort if aspect ratios don't match<br/>
                  • Maintain aspect ratio to prevent distortion
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
              {processing ? 'Resizing...' : `Resize to ${targetWidth}×${targetHeight}`}
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
