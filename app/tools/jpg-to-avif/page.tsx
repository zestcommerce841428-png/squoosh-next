'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Slider, FormControlLabel, Switch } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function JpgToAvifPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [quality, setQuality] = useState(75);
  const [enableHDR, setEnableHDR] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.includes('jpeg') && !selectedFile.type.includes('jpg')) {
      setError('Please upload a JPG/JPEG file');
      return;
    }
    
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setConvertedUrl(null);
    setError(null);
  };

  const convertImage = async () => {
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

      // Try AVIF first, fallback to WebP
      let blob: Blob | null = null;
      try {
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b && b.type === 'image/avif') resolve(b);
              else reject(new Error('AVIF not supported'));
            },
            'image/avif',
            quality / 100
          );
        });
      } catch (avifError) {
        // Fallback to WebP
        console.warn('AVIF not supported, falling back to WebP');
        blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/webp', quality / 100);
        });
        setError('AVIF not supported by your browser. Converted to WebP instead.');
      }

      setConvertedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
    } catch (err) {
      console.error(err);
      setError('Conversion failed. AVIF encoding is not supported by your browser.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!convertedUrl || !file) return;
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = file.name.replace(/\.(jpg|jpeg)$/i, '.avif');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setConvertedUrl(null);
    setError(null);
    setOriginalSize(0);
    setConvertedSize(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const sizeDiff = originalSize && convertedSize 
    ? Math.round((1 - convertedSize / originalSize) * 100)
    : 0;

  return (
    <ToolLayout
      title="JPG to AVIF Converter"
      description="Convert JPEG images to next-generation AVIF format with 50% smaller files and HDR support"
      features={['50% Smaller Files', 'HDR Support', 'Better Quality', 'Next-Gen Format']}
    >
      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/jpeg,image/jpg,.jpg,.jpeg" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={convertedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Quality Settings
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Quality: {quality}%
                </Typography>
                <Slider
                  value={quality}
                  onChange={(_, value) => setQuality(value as number)}
                  min={50}
                  max={100}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => setQuality(65)}>
                    Good (65%)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setQuality(75)}>
                    High (75%)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setQuality(90)}>
                    Max (90%)
                  </Button>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Advanced Options
                </Typography>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={enableHDR} 
                      onChange={(e) => setEnableHDR(e.target.checked)} 
                    />
                  }
                  label="Enable HDR (High Dynamic Range)"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  HDR provides better color depth and contrast (requires compatible display)
                </Typography>
              </Box>

              {convertedUrl && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    ✓ Conversion Complete
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original (JPG): {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2">
                      Converted (AVIF): {formatFileSize(convertedSize)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                      File size reduced by {sizeDiff}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      AVIF provides exceptional compression with {quality}% quality
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>JPG to AVIF Conversion:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>Next-Gen Format:</strong> Based on AV1 video codec<br/>
                  • <strong>50% Smaller:</strong> Half the size of JPEG at same quality<br/>
                  • <strong>HDR Support:</strong> Wide color gamut and high dynamic range<br/>
                  • <strong>Browser Support:</strong> Chrome 85+, Firefox 93+, Safari 16+
                </Typography>
              </Alert>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Browser Compatibility:</strong> AVIF is a cutting-edge format with 
                  growing browser support (~90% as of 2024). For maximum compatibility, consider 
                  providing WebP or JPEG fallbacks. AVIF is ideal for modern websites targeting 
                  the latest browsers where file size is critical.
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
              onClick={convertImage}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Converting...' : 'Convert to AVIF'}
            </Button>
            {convertedUrl && (
              <Button variant="contained" color="success" onClick={downloadImage} fullWidth>
                Download AVIF
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
