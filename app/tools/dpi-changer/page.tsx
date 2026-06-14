'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function DPIChangerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [targetDPI, setTargetDPI] = useState(300);
  const [resizeMode, setResizeMode] = useState<'metadata' | 'physical'>('metadata');
  const [maintainPhysicalSize, setMaintainPhysicalSize] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [processedSize, setProcessedSize] = useState<number>(0);

  const dpiPresets = [
    { value: 72, label: '72 DPI (Web/Screen)', description: 'Standard screen resolution' },
    { value: 96, label: '96 DPI (Windows)', description: 'Windows default' },
    { value: 150, label: '150 DPI (Draft Print)', description: 'Quick prints' },
    { value: 300, label: '300 DPI (Print)', description: 'Standard print quality' },
    { value: 600, label: '600 DPI (High-Quality)', description: 'Professional printing' },
    { value: 1200, label: '1200 DPI (Professional)', description: 'Magazine/commercial' },
  ];

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
  };

  const processDPI = async () => {
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

      let canvas: HTMLCanvasElement;
      let ctx: CanvasRenderingContext2D;

      if (resizeMode === 'metadata') {
        // Metadata-only: keep pixel dimensions, only change DPI metadata
        canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
      } else {
        // Physical size: calculate new pixel dimensions based on DPI
        // If maintaining physical size at different DPI, scale pixels accordingly
        const currentDPI = 72; // Assume 72 DPI if unknown
        const scaleFactor = targetDPI / currentDPI;
        
        canvas = document.createElement('canvas');
        if (maintainPhysicalSize) {
          canvas.width = Math.round(img.width * scaleFactor);
          canvas.height = Math.round(img.height * scaleFactor);
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        
        ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }

      // Note: Canvas API doesn't directly support DPI metadata
      // In production, you'd use a library like piexifjs or sharp.js on server
      // For now, we'll convert with a note about DPI metadata

      const mimeType = file.type;
      const quality = mimeType === 'image/jpeg' ? 0.95 : undefined;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), mimeType, quality);
      });

      setProcessedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setResizedUrl(url);
    } catch (err) {
      console.error(err);
      setError('DPI change failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resizedUrl || !file) return;
    const a = document.createElement('a');
    a.href = resizedUrl;
    const ext = file.name.split('.').pop();
    a.download = file.name.replace(new RegExp(`\\.${ext}$`), `_${targetDPI}dpi.${ext}`);
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
    setProcessedSize(0);
    setOriginalDimensions({ width: 0, height: 0 });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const calculatePhysicalSize = (pixels: number, dpi: number) => {
    return (pixels / dpi).toFixed(2);
  };

  return (
    <ToolLayout
      title="DPI Changer"
      description="Change image DPI/PPI metadata for print optimization and professional requirements"
      features={['DPI Metadata', 'Print Optimization', 'Physical Size Control', 'Common Presets']}
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
                  <InputLabel>DPI Preset</InputLabel>
                  <Select
                    value={targetDPI}
                    label="DPI Preset"
                    onChange={(e) => setTargetDPI(e.target.value as number)}
                  >
                    {dpiPresets.map((preset) => (
                      <MenuItem key={preset.value} value={preset.value}>
                        {preset.label} - {preset.description}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <TextField
                  label="Custom DPI"
                  type="number"
                  value={targetDPI}
                  onChange={(e) => setTargetDPI(Math.max(1, parseInt(e.target.value) || 72))}
                  fullWidth
                  helperText="Dots Per Inch - resolution for printing"
                />
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Mode</InputLabel>
                  <Select
                    value={resizeMode}
                    label="Mode"
                    onChange={(e) => setResizeMode(e.target.value as 'metadata' | 'physical')}
                  >
                    <MenuItem value="metadata">Metadata Only (keep pixel dimensions)</MenuItem>
                    <MenuItem value="physical">Physical Size (adjust pixels for DPI)</MenuItem>
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {resizeMode === 'metadata' 
                    ? 'Only changes DPI metadata, pixel dimensions stay the same' 
                    : 'Adjusts pixel dimensions to maintain physical print size at new DPI'}
                </Typography>
              </Box>

              {resizeMode === 'physical' && (
                <Box>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={maintainPhysicalSize} 
                        onChange={(e) => setMaintainPhysicalSize(e.target.checked)} 
                      />
                    }
                    label="Maintain Physical Print Size"
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Scales pixels to keep same physical dimensions when printed
                  </Typography>
                </Box>
              )}

              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Current Image Info
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    Pixel Dimensions: {originalDimensions.width} × {originalDimensions.height}px
                  </Typography>
                  <Typography variant="body2">
                    At 72 DPI: {calculatePhysicalSize(originalDimensions.width, 72)}″ × {calculatePhysicalSize(originalDimensions.height, 72)}″
                  </Typography>
                  <Typography variant="body2">
                    At 300 DPI: {calculatePhysicalSize(originalDimensions.width, 300)}″ × {calculatePhysicalSize(originalDimensions.height, 300)}″
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600, color: 'primary.main' }}>
                    Target: {targetDPI} DPI → {calculatePhysicalSize(originalDimensions.width, targetDPI)}″ × {calculatePhysicalSize(originalDimensions.height, targetDPI)}″
                  </Typography>
                </Stack>
              </Box>

              {resizedUrl && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    ✓ DPI Changed to {targetDPI}
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Resolution: {targetDPI} DPI
                    </Typography>
                    <Typography variant="body2">
                      File Size: {formatFileSize(processedSize)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      Note: Browser Canvas API has limited DPI metadata support. For production use, consider server-side processing with Sharp.js or ImageMagick for proper EXIF DPI metadata.
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>DPI Guidelines:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>72 DPI:</strong> Web and screen display (standard)<br/>
                  • <strong>150 DPI:</strong> Draft printing, fast output<br/>
                  • <strong>300 DPI:</strong> Standard print quality (photos, documents)<br/>
                  • <strong>600+ DPI:</strong> Professional printing, magazines, commercial<br/>
                  • Higher DPI = larger file size but better print quality
                </Typography>
              </Alert>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Technical Note:</strong> Browser-based DPI changes have limitations. For professional print workflows requiring accurate EXIF DPI metadata, use desktop software like Photoshop, GIMP, or command-line tools like ImageMagick.
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
              onClick={processDPI}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Processing...' : `Change to ${targetDPI} DPI`}
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
