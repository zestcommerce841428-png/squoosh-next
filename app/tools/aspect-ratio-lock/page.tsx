'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

type AspectRatio = '16:9' | '4:3' | '1:1' | '3:2' | '2:1' | '9:16' | '3:4' | '21:9' | 'custom';

export default function AspectRatioLockPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('16:9');
  const [customWidth, setCustomWidth] = useState(16);
  const [customHeight, setCustomHeight] = useState(9);
  const [targetSize, setTargetSize] = useState(1920);
  const [cropMode, setCropMode] = useState<'crop' | 'fit'>('crop');
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [newDimensions, setNewDimensions] = useState({ width: 0, height: 0 });

  const aspectRatios: Record<AspectRatio, { width: number; height: number; label: string }> = {
    '16:9': { width: 16, height: 9, label: '16:9 (Widescreen)' },
    '4:3': { width: 4, height: 3, label: '4:3 (Standard)' },
    '1:1': { width: 1, height: 1, label: '1:1 (Square)' },
    '3:2': { width: 3, height: 2, label: '3:2 (Classic Photo)' },
    '2:1': { width: 2, height: 1, label: '2:1 (Panorama)' },
    '9:16': { width: 9, height: 16, label: '9:16 (Portrait)' },
    '3:4': { width: 3, height: 4, label: '3:4 (Portrait)' },
    '21:9': { width: 21, height: 9, label: '21:9 (Ultra-wide)' },
    'custom': { width: customWidth, height: customHeight, label: 'Custom Ratio' },
  };

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

    const img = new Image();
    img.src = url;
    await new Promise((resolve) => { img.onload = resolve; });
    setOriginalDimensions({ width: img.width, height: img.height });
    
    calculateNewDimensions(img.width, img.height);
  };

  const calculateNewDimensions = (origWidth: number, origHeight: number) => {
    const ratio = aspectRatios[selectedRatio];
    const aspectRatio = ratio.width / ratio.height;
    
    let newWidth = targetSize;
    let newHeight = Math.round(targetSize / aspectRatio);
    
    // Ensure dimensions are reasonable
    if (newHeight > 4096) {
      newHeight = 4096;
      newWidth = Math.round(newHeight * aspectRatio);
    }
    
    setNewDimensions({ width: newWidth, height: newHeight });
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

      const ratio = aspectRatios[selectedRatio];
      const targetAspectRatio = ratio.width / ratio.height;
      
      let canvasWidth = newDimensions.width;
      let canvasHeight = newDimensions.height;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d')!;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (cropMode === 'crop') {
        // Crop to fill canvas
        const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (canvasWidth - scaledWidth) / 2;
        const offsetY = (canvasHeight - scaledHeight) / 2;
        
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      } else {
        // Fit with padding
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (canvasWidth - scaledWidth) / 2;
        const offsetY = (canvasHeight - scaledHeight) / 2;
        
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      }

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
    const ratioLabel = selectedRatio === 'custom' ? `${customWidth}-${customHeight}` : selectedRatio.replace(':', '-');
    a.download = file.name.replace(new RegExp(`\\.${ext}$`), `_${ratioLabel}.${ext}`);
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

  return (
    <ToolLayout
      title="Aspect Ratio Lock"
      description="Resize images while enforcing specific aspect ratios with crop or fit modes"
      features={['Preset Ratios', 'Custom Ratios', 'Crop/Fit Modes', 'Professional Framing']}
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
                <FormControl fullWidth>
                  <InputLabel>Aspect Ratio</InputLabel>
                  <Select
                    value={selectedRatio}
                    label="Aspect Ratio"
                    onChange={(e) => {
                      const ratio = e.target.value as AspectRatio;
                      setSelectedRatio(ratio);
                      calculateNewDimensions(originalDimensions.width, originalDimensions.height);
                    }}
                  >
                    {Object.entries(aspectRatios).map(([key, { label }]) => (
                      <MenuItem key={key} value={key}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {selectedRatio === 'custom' && (
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Width Ratio"
                    type="number"
                    value={customWidth}
                    onChange={(e) => {
                      setCustomWidth(Math.max(1, parseInt(e.target.value) || 1));
                      calculateNewDimensions(originalDimensions.width, originalDimensions.height);
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Height Ratio"
                    type="number"
                    value={customHeight}
                    onChange={(e) => {
                      setCustomHeight(Math.max(1, parseInt(e.target.value) || 1));
                      calculateNewDimensions(originalDimensions.width, originalDimensions.height);
                    }}
                    fullWidth
                  />
                </Stack>
              )}

              <Box>
                <TextField
                  label="Target Width (px)"
                  type="number"
                  value={targetSize}
                  onChange={(e) => {
                    setTargetSize(Math.max(1, parseInt(e.target.value) || 1));
                    calculateNewDimensions(originalDimensions.width, originalDimensions.height);
                  }}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Height will be calculated automatically based on aspect ratio
                </Typography>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Crop Mode</InputLabel>
                  <Select
                    value={cropMode}
                    label="Crop Mode"
                    onChange={(e) => setCropMode(e.target.value as 'crop' | 'fit')}
                  >
                    <MenuItem value="crop">Crop (fill frame, crop excess)</MenuItem>
                    <MenuItem value="fit">Fit (add padding to fit entire image)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Dimensions Preview
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    Original: {originalDimensions.width} × {originalDimensions.height}px
                  </Typography>
                  <Typography variant="body2">
                    Original Ratio: {(originalDimensions.width / originalDimensions.height).toFixed(2)}:1
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    New: {newDimensions.width} × {newDimensions.height}px
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main' }}>
                    Target Ratio: {aspectRatios[selectedRatio].width}:{aspectRatios[selectedRatio].height}
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
                      Dimensions: {newDimensions.width} × {newDimensions.height}px
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>Common Aspect Ratios:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>16:9:</strong> YouTube, HD video, modern displays<br/>
                  • <strong>1:1:</strong> Instagram posts, profile pictures<br/>
                  • <strong>9:16:</strong> Instagram Stories, TikTok, mobile<br/>
                  • <strong>4:3:</strong> Classic photography, older displays<br/>
                  • <strong>21:9:</strong> Cinematic, ultra-wide displays
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
              {processing ? 'Processing...' : `Apply ${selectedRatio} Ratio`}
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
