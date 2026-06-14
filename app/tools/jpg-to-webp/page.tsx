'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Slider, FormControlLabel, Switch } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function JpgToWebPPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [quality, setQuality] = useState(85);
  const [lossless, setLossless] = useState(false);
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

      // Convert to WebP
      const qualityValue = lossless ? 1.0 : quality / 100;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('WebP conversion failed'));
          },
          'image/webp',
          qualityValue
        );
      });

      setConvertedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
    } catch (err) {
      console.error(err);
      setError('WebP conversion failed. Your browser may not support WebP encoding.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!convertedUrl || !file) return;
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = file.name.replace(/\.(jpg|jpeg)$/i, '.webp');
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
      title="JPG to WebP Converter"
      description="Convert JPEG images to modern WebP format with 30% smaller file sizes and superior compression"
      features={['30% Size Reduction', 'Better Quality', 'Lossless Mode', 'Modern Format']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/jpeg,image/jpg,.jpg,.jpeg" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={convertedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Compression Mode
                </Typography>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={lossless} 
                      onChange={(e) => setLossless(e.target.checked)} 
                    />
                  }
                  label="Lossless Mode (Larger file size, perfect quality)"
                />
              </Box>

              {!lossless && (
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
                    min={60}
                    max={100}
                    step={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button size="small" variant="outlined" onClick={() => setQuality(75)}>
                      Good (75%)
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => setQuality(85)}>
                      High (85%)
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => setQuality(95)}>
                      Max (95%)
                    </Button>
                  </Stack>
                </Box>
              )}

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
                      Converted (WebP): {formatFileSize(convertedSize)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                      File size reduced by {sizeDiff}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      WebP provides better compression with {lossless ? 'perfect' : quality + '%'} quality
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>JPG to WebP Conversion:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>Superior Compression:</strong> 25-35% smaller than JPEG at same quality<br/>
                  • <strong>Better Quality:</strong> Advanced compression algorithms preserve details<br/>
                  • <strong>Transparency Support:</strong> Optional alpha channel<br/>
                  • <strong>Browser Support:</strong> 96%+ modern browsers (Chrome, Firefox, Edge, Safari 14+)
                </Typography>
              </Alert>

              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Why WebP?</strong> WebP is a modern image format developed by Google 
                  that provides superior compression for web images. It's perfect for reducing 
                  website load times while maintaining excellent visual quality. Use WebP for 
                  faster websites and lower bandwidth costs.
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
              {processing ? 'Converting...' : 'Convert to WebP'}
            </Button>
            {convertedUrl && (
              <Button variant="contained" color="success" onClick={downloadImage} fullWidth>
                Download WebP
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
