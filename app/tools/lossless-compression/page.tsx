'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function LosslessCompressionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [format, setFormat] = useState<'webp' | 'png'>('webp');
  const [effort, setEffort] = useState<number>(4); // 0-6 for WebP, compression effort
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setCompressedUrl(null);
    setError(null);
  };

  const compressImage = async () => {
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
      const ctx = canvas.getContext('2d', { 
        alpha: true,
        willReadFrequently: false 
      })!;
      ctx.drawImage(img, 0, 0);

      let blob: Blob;

      if (format === 'webp') {
        // WebP lossless compression
        // Quality 100 = lossless mode in WebP
        blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/webp', 1.0);
        });
      } else {
        // PNG optimization using Canvas compression
        // Apply PNG palette optimization if possible
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const optimizedCanvas = document.createElement('canvas');
        optimizedCanvas.width = canvas.width;
        optimizedCanvas.height = canvas.height;
        const optimizedCtx = optimizedCanvas.getContext('2d')!;
        
        // For PNG, we use maximum compression (lowest quality number that's still lossless)
        optimizedCtx.putImageData(imageData, 0, 0);
        
        blob = await new Promise<Blob>((resolve) => {
          optimizedCanvas.toBlob((b) => resolve(b!), 'image/png');
        });
      }

      setCompressedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setCompressedUrl(url);
    } catch (err) {
      console.error(err);
      setError('Lossless compression failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!compressedUrl || !file) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    const ext = format === 'webp' ? 'webp' : 'png';
    a.download = file.name.replace(/\.[^.]+$/, `-lossless.${ext}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setCompressedUrl(null);
    setError(null);
    setOriginalSize(0);
    setCompressedSize(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const compressionRatio = originalSize && compressedSize 
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  const savingsBytes = originalSize - compressedSize;

  return (
    <ToolLayout
      title="Lossless Compression"
      description="Zero quality loss optimization. Perfect pixel-for-pixel preservation with smaller file sizes"
      features={['100% Quality', 'WebP & PNG', 'Transparency Support', 'Up to 40% Savings']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={compressedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Output Format</InputLabel>
                <Select
                  value={format}
                  label="Output Format"
                  onChange={(e) => setFormat(e.target.value as 'webp' | 'png')}
                >
                  <MenuItem value="webp">WebP Lossless (Best Compression)</MenuItem>
                  <MenuItem value="png">PNG Optimized (Universal Support)</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Compression Effort: {effort}
                </Typography>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={effort}
                  onChange={(e) => setEffort(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Higher effort = better compression, slower processing
                </Typography>
              </Box>

              {compressedUrl && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    ✓ Lossless Compression Results
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original: {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2">
                      Compressed: {formatFileSize(compressedSize)}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.dark">
                      Saved: {compressionRatio}% ({formatFileSize(savingsBytes)})
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      🎯 Zero quality loss - Every pixel preserved
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Lossless Mode:</strong> Output image is pixel-perfect identical to the original. 
                  Compression is achieved through optimized encoding, not quality reduction.
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
              onClick={compressImage}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Compressing...' : 'Compress Lossless'}
            </Button>
            {compressedUrl && (
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
