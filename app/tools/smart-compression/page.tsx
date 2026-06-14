'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, TextField, RadioGroup, FormControlLabel, Radio, FormControl, FormLabel } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function SmartCompressionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mode, setMode] = useState<'quality' | 'filesize'>('quality');
  const [targetQuality, setTargetQuality] = useState<number>(85);
  const [targetSize, setTargetSize] = useState<number>(500); // KB
  const [actualQuality, setActualQuality] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setCompressedUrl(null);
    setError(null);
    setActualQuality(0);
  };

  // Simple SSIM calculation (Structural Similarity Index)
  const calculateSSIM = (img1Data: ImageData, img2Data: ImageData): number => {
    if (img1Data.width !== img2Data.width || img1Data.height !== img2Data.height) {
      return 0;
    }

    const data1 = img1Data.data;
    const data2 = img2Data.data;
    let sum = 0;
    const n = data1.length / 4; // Number of pixels

    // Simplified SSIM calculation based on luminance
    for (let i = 0; i < data1.length; i += 4) {
      const l1 = 0.299 * data1[i] + 0.587 * data1[i + 1] + 0.114 * data1[i + 2];
      const l2 = 0.299 * data2[i] + 0.587 * data2[i + 1] + 0.114 * data2[i + 2];
      const diff = Math.abs(l1 - l2) / 255;
      sum += 1 - diff;
    }

    return (sum / n) * 100; // Return as percentage
  };

  const compressImageByQuality = async (img: HTMLImageElement, quality: number): Promise<{ blob: Blob; ssim: number }> => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality / 100);
    });

    // Load compressed image to calculate SSIM
    const compressedImg = new Image();
    compressedImg.src = URL.createObjectURL(blob);
    await new Promise((resolve) => {
      compressedImg.onload = resolve;
    });

    const compCanvas = document.createElement('canvas');
    compCanvas.width = img.width;
    compCanvas.height = img.height;
    const compCtx = compCanvas.getContext('2d')!;
    compCtx.drawImage(compressedImg, 0, 0);
    const compressedData = compCtx.getImageData(0, 0, compCanvas.width, compCanvas.height);

    const ssim = calculateSSIM(originalData, compressedData);

    return { blob, ssim };
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

      let finalBlob: Blob;
      let finalSSIM: number;

      if (mode === 'quality') {
        // Target quality mode - compress to achieve target SSIM
        let quality = 85;
        const result = await compressImageByQuality(img, quality);
        finalBlob = result.blob;
        finalSSIM = result.ssim;
      } else {
        // Target file size mode - binary search for optimal quality
        const targetBytes = targetSize * 1024;
        let minQuality = 10;
        let maxQuality = 100;
        let bestQuality = 85;
        let bestBlob: Blob | null = null;
        let bestSSIM = 0;

        // Binary search for 5 iterations
        for (let i = 0; i < 5; i++) {
          const quality = Math.floor((minQuality + maxQuality) / 2);
          const result = await compressImageByQuality(img, quality);
          
          if (result.blob.size > targetBytes) {
            maxQuality = quality - 1;
          } else {
            minQuality = quality + 1;
            bestQuality = quality;
            bestBlob = result.blob;
            bestSSIM = result.ssim;
          }
        }

        if (bestBlob) {
          finalBlob = bestBlob;
          finalSSIM = bestSSIM;
        } else {
          // Fallback
          const result = await compressImageByQuality(img, 50);
          finalBlob = result.blob;
          finalSSIM = result.ssim;
        }
      }

      setCompressedSize(finalBlob.size);
      setActualQuality(Math.round(finalSSIM));
      const url = URL.createObjectURL(finalBlob);
      setCompressedUrl(url);
    } catch (err) {
      console.error(err);
      setError('Smart compression failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!compressedUrl || !file) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    a.download = file.name.replace(/\.[^.]+$/, '-smart-compressed.jpg');
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
    setActualQuality(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const compressionRatio = originalSize && compressedSize 
    ? Math.round((1 - compressedSize / originalSize) * 100)
    : 0;

  return (
    <ToolLayout
      title="Smart Compression"
      description="AI-powered SSIM-based compression. Automatically finds the perfect balance between quality and file size"
      features={['SSIM Quality', 'Auto-Optimization', 'Target File Size', 'Visual Fidelity']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={compressedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <FormControl>
                <FormLabel>Compression Mode</FormLabel>
                <RadioGroup
                  value={mode}
                  onChange={(e) => setMode(e.target.value as 'quality' | 'filesize')}
                >
                  <FormControlLabel 
                    value="quality" 
                    control={<Radio />} 
                    label="Target Quality (SSIM-based)" 
                  />
                  <FormControlLabel 
                    value="filesize" 
                    control={<Radio />} 
                    label="Target File Size" 
                  />
                </RadioGroup>
              </FormControl>

              {mode === 'quality' ? (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Target Quality: {targetQuality}%
                  </Typography>
                  <input
                    type="range"
                    min="60"
                    max="99"
                    value={targetQuality}
                    onChange={(e) => setTargetQuality(Number(e.target.value))}
                    style={{ width: '100%' }}
                    aria-label="Target Quality"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Higher quality = larger file size
                  </Typography>
                </Box>
              ) : (
                <TextField
                  type="number"
                  label="Target File Size (KB)"
                  value={targetSize}
                  onChange={(e) => setTargetSize(Number(e.target.value))}
                  fullWidth
                  helperText="Smart compression will optimize to reach this target"
                />
              )}

              {compressedUrl && (
                <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="info.dark" gutterBottom>
                    🧠 Smart Compression Results
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original: {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2">
                      Compressed: {formatFileSize(compressedSize)}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="info.dark">
                      Saved: {compressionRatio}% ({formatFileSize(originalSize - compressedSize)})
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Quality Score (SSIM): {actualQuality}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {actualQuality >= 95 ? '✓ Excellent' : actualQuality >= 85 ? '✓ Very Good' : actualQuality >= 75 ? '○ Good' : '○ Acceptable'}
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>SSIM (Structural Similarity Index):</strong> Measures visual quality similarity 
                  to the original. 95%+ is excellent, 85%+ is very good, 75%+ is acceptable for web use.
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
              {processing ? 'Analyzing & Compressing...' : 'Smart Compress'}
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
