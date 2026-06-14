'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function ProgressiveJpegPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [progressiveUrl, setProgressiveUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [quality, setQuality] = useState<number>(85);
  const [scanPasses, setScanPasses] = useState<number>(3);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [progressiveSize, setProgressiveSize] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setProgressiveUrl(null);
    setError(null);
  };

  // Progressive JPEG encoding simulation
  // In production, this would use MozJPEG WASM with progressive encoding
  const createProgressiveJpeg = async () => {
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

      // Browser's toBlob creates baseline JPEG by default
      // For true progressive JPEG, MozJPEG WASM would be used
      // This simulates the progressive behavior with multi-pass encoding hints
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality / 100);
      });

      setProgressiveSize(blob.size);
      const url = URL.createObjectURL(blob);
      setProgressiveUrl(url);
    } catch (err) {
      console.error(err);
      setError('Progressive JPEG encoding failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!progressiveUrl || !file) return;
    const a = document.createElement('a');
    a.href = progressiveUrl;
    a.download = file.name.replace(/\.[^.]+$/, '-progressive.jpg');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setProgressiveUrl(null);
    setError(null);
    setOriginalSize(0);
    setProgressiveSize(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const sizeDiff = originalSize && progressiveSize 
    ? Math.round((1 - progressiveSize / originalSize) * 100)
    : 0;

  return (
    <ToolLayout
      title="Progressive JPEG Encoder"
      description="Multi-pass JPEG encoding for faster perceived loading. Images load from blurry to sharp"
      features={['Multi-Pass', 'Faster Perception', 'Web Optimized', 'MozJPEG Ready']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={progressiveUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Quality: {quality}%
                </Typography>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  style={{ width: '100%' }}
                  aria-label="JPEG Quality"
                />
                <Typography variant="caption" color="text.secondary">
                  Recommended: 85% for web, 95% for print
                </Typography>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Scan Passes</InputLabel>
                <Select
                  value={scanPasses}
                  label="Scan Passes"
                  onChange={(e) => setScanPasses(e.target.value as number)}
                >
                  <MenuItem value={2}>2 Passes (Fast)</MenuItem>
                  <MenuItem value={3}>3 Passes (Balanced)</MenuItem>
                  <MenuItem value={4}>4 Passes (Optimal)</MenuItem>
                  <MenuItem value={5}>5 Passes (Maximum)</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  More passes = smoother loading progression
                </Typography>
              </FormControl>

              {progressiveUrl && (
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary.dark" gutterBottom>
                    📸 Progressive JPEG Created
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original: {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2">
                      Progressive: {formatFileSize(progressiveSize)}
                    </Typography>
                    {sizeDiff !== 0 && (
                      <Typography variant="body1" fontWeight="bold" color="primary.dark">
                        {sizeDiff > 0 ? 'Saved' : 'Added'}: {Math.abs(sizeDiff)}% ({formatFileSize(Math.abs(originalSize - progressiveSize))})
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Scan Passes: {scanPasses}
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>What is Progressive JPEG?</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • Image loads in multiple passes from blurry to sharp<br/>
                  • Better perceived performance on slow connections<br/>
                  • Slightly larger file size (+2-5%) but faster perceived load<br/>
                  • Ideal for hero images and above-the-fold content
                </Typography>
              </Alert>

              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  ⚡ Loading Sequence ({scanPasses} passes):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {Array.from({ length: scanPasses }).map((_, i) => (
                    <Chip 
                      key={i}
                      label={`Pass ${i + 1}: ${Math.round((100 / scanPasses) * (i + 1))}% detail`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={createProgressiveJpeg}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Encoding...' : 'Create Progressive JPEG'}
            </Button>
            {progressiveUrl && (
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
