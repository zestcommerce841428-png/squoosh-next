'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function PngToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [quality, setQuality] = useState(90);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);

  const bgColorOptions = [
    { value: '#FFFFFF', label: 'White' },
    { value: '#000000', label: 'Black' },
    { value: '#FF0000', label: 'Red' },
    { value: '#00FF00', label: 'Green' },
    { value: '#0000FF', label: 'Blue' },
    { value: '#FFFF00', label: 'Yellow' },
  ];

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.includes('png')) {
      setError('Please upload a PNG file');
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
      const ctx = canvas.getContext('2d', { alpha: false })!;
      
      // Fill with background color (JPG doesn't support transparency)
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw image on top
      ctx.drawImage(img, 0, 0);

      // Convert to JPEG with quality setting
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', quality / 100);
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
    a.download = file.name.replace(/\.png$/i, '.jpg');
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
      title="PNG to JPG Converter"
      description="Convert lossless PNG images to lossy JPEG format with background color injection and quality control"
      features={['Background Color', 'Quality Control', 'Size Reduction', 'Instant Convert']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/png,.png" />
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
                  min={60}
                  max={100}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => setQuality(80)}>
                    Good (80%)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setQuality(90)}>
                    High (90%)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setQuality(95)}>
                    Max (95%)
                  </Button>
                </Stack>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Background Color</InputLabel>
                  <Select
                    value={backgroundColor}
                    label="Background Color"
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  >
                    {bgColorOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              bgcolor: option.value,
                              border: '1px solid #ccc',
                              borderRadius: 0.5,
                            }}
                          />
                          <Typography>{option.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Transparent areas will be replaced with this color (JPG doesn't support transparency)
                </Typography>
              </Box>

              {convertedUrl && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    ✓ Conversion Complete
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original (PNG): {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2">
                      Converted (JPG): {formatFileSize(convertedSize)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
                      File size reduced by {sizeDiff}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      JPG compression achieved {sizeDiff}% reduction at {quality}% quality
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>PNG to JPG Conversion:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>Lossy Format:</strong> JPG reduces file size through compression<br/>
                  • <strong>No Transparency:</strong> Transparent areas filled with selected color<br/>
                  • <strong>File Size:</strong> JPGs are typically 60-80% smaller than PNGs<br/>
                  • <strong>Best For:</strong> Photos, social media, web images
                </Typography>
              </Alert>

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Note:</strong> JPEG is a lossy format. Some quality will be lost during 
                  conversion. This is ideal for photos and images where file size matters more 
                  than perfect quality. Not recommended for text, logos, or images with transparency.
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
              {processing ? 'Converting...' : 'Convert to JPG'}
            </Button>
            {convertedUrl && (
              <Button variant="contained" color="success" onClick={downloadImage} fullWidth>
                Download JPG
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
