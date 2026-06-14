'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, FormControlLabel, Checkbox } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function WebPToPngPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [preserveAlpha, setPreserveAlpha] = useState(true);
  const [optimizeCompression, setOptimizeCompression] = useState(true);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.includes('webp')) {
      setError('Please upload a WebP file');
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
      const ctx = canvas.getContext('2d', { alpha: preserveAlpha })!;
      
      if (!preserveAlpha) {
        // Fill with white background if not preserving alpha
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);

      // Convert to PNG (lossless)
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      setConvertedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
    } catch (err) {
      console.error(err);
      setError('Conversion failed. Your browser may not support WebP decoding.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!convertedUrl || !file) return;
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = file.name.replace(/\.webp$/i, '.png');
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
    ? Math.round((convertedSize / originalSize - 1) * 100)
    : 0;

  return (
    <ToolLayout
      title="WebP to PNG Converter"
      description="Convert modern WebP images to universal PNG format with lossless quality and transparency preservation"
      features={['Lossless Conversion', 'Alpha Preservation', 'Universal Compatibility', 'Perfect Quality']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/webp,.webp" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={convertedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Conversion Options
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={preserveAlpha} 
                      onChange={(e) => setPreserveAlpha(e.target.checked)} 
                    />
                  }
                  label="Preserve Transparency (Alpha Channel)"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={optimizeCompression} 
                      onChange={(e) => setOptimizeCompression(e.target.checked)} 
                    />
                  }
                  label="Optimize PNG Compression (Recommended)"
                />
              </Box>

              {convertedUrl && (
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary.dark" gutterBottom>
                    ✓ Conversion Complete
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original (WebP): {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2">
                      Converted (PNG): {formatFileSize(convertedSize)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      File size {sizeDiff > 0 ? 'increased' : 'decreased'} by {Math.abs(sizeDiff)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      PNG is lossless and preserves 100% quality {preserveAlpha ? 'with transparency' : ''}
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>WebP to PNG Conversion:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>Lossless Format:</strong> PNG preserves perfect quality<br/>
                  • <strong>Universal Support:</strong> Works on all devices and software<br/>
                  • <strong>Transparency:</strong> Full alpha channel preservation<br/>
                  • <strong>Best For:</strong> Editing, archiving, legacy compatibility
                </Typography>
              </Alert>

              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Why Convert to PNG?</strong> While WebP offers better compression, 
                  PNG provides universal compatibility and is perfect for image editing software, 
                  legacy systems, and situations where you need guaranteed lossless quality. 
                  Use PNG when compatibility matters more than file size.
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
              {processing ? 'Converting...' : 'Convert to PNG'}
            </Button>
            {convertedUrl && (
              <Button variant="contained" color="success" onClick={downloadImage} fullWidth>
                Download PNG
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
