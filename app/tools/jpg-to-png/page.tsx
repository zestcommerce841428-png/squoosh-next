'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, FormControlLabel, Checkbox } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function JpgToPngPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [preserveQuality, setPreserveQuality] = useState(true);
  const [addTransparency, setAddTransparency] = useState(false);
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
      const ctx = canvas.getContext('2d', { alpha: addTransparency })!;
      
      // If adding transparency, clear canvas first
      if (addTransparency) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);

      // Convert to PNG (always lossless)
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      setConvertedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
    } catch (err) {
      console.error(err);
      setError('Conversion failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!convertedUrl || !file) return;
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = file.name.replace(/\.(jpg|jpeg)$/i, '.png');
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
      title="JPG to PNG Converter"
      description="Convert lossy JPEG images to lossless PNG format with alpha channel support"
      features={['Lossless Conversion', 'Transparency Support', 'Quality Preservation', 'Instant Convert']}
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
                  Conversion Options
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={preserveQuality} 
                      onChange={(e) => setPreserveQuality(e.target.checked)} 
                    />
                  }
                  label="Preserve Maximum Quality (Recommended)"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={addTransparency} 
                      onChange={(e) => setAddTransparency(e.target.checked)} 
                    />
                  }
                  label="Enable Alpha Channel (Transparency Support)"
                />
              </Box>

              {convertedUrl && (
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary.dark" gutterBottom>
                    ✓ Conversion Complete
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original (JPG): {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2">
                      Converted (PNG): {formatFileSize(convertedSize)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      File size {sizeDiff > 0 ? 'increased' : 'decreased'} by {Math.abs(sizeDiff)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      PNG is larger due to lossless compression, but preserves 100% quality
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>JPG to PNG Conversion:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>Lossless Format:</strong> PNG preserves every pixel perfectly<br/>
                  • <strong>Transparency:</strong> Enable alpha channel for future editing<br/>
                  • <strong>File Size:</strong> PNGs are typically 2-5x larger than JPGs<br/>
                  • <strong>Best For:</strong> Graphics, logos, images needing transparency
                </Typography>
              </Alert>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Note:</strong> Converting from JPG to PNG doesn't improve quality - 
                  JPG compression artifacts remain. This is useful for enabling transparency 
                  or preparing for further lossless editing.
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
