'use client';

import { useState } from 'react';
import { Card, Stack, Alert, ToggleButtonGroup, ToggleButton, Typography, Slider, Box } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea, ActionButtons } from '@/components/ToolComponents';

const aspectRatios = [
  { label: '1:1 (Square)', value: 1 },
  { label: '4:3 (Standard)', value: 4/3 },
  { label: '16:9 (Widescreen)', value: 16/9 },
  { label: '9:16 (Story)', value: 9/16 },
  { label: '21:9 (Ultrawide)', value: 21/9 },
  { label: 'Free', value: 0 },
];

export default function SmartCropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [cropPosition, setCropPosition] = useState<'center' | 'top' | 'bottom' | 'left' | 'right'>('center');
  const [zoom, setZoom] = useState<number>(100);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setCroppedUrl(null);
    setError(null);
  };

  const cropImage = async () => {
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
      const ctx = canvas.getContext('2d')!;

      let cropWidth: number;
      let cropHeight: number;
      
      if (aspectRatio === 0) {
        cropWidth = img.width * (zoom / 100);
        cropHeight = img.height * (zoom / 100);
      } else {
        const imgAspect = img.width / img.height;
        
        if (imgAspect > aspectRatio) {
          cropHeight = img.height;
          cropWidth = cropHeight * aspectRatio;
        } else {
          cropWidth = img.width;
          cropHeight = cropWidth / aspectRatio;
        }
        
        cropWidth *= (zoom / 100);
        cropHeight *= (zoom / 100);
      }

      let sx: number, sy: number;
      
      switch (cropPosition) {
        case 'top':
          sx = (img.width - cropWidth) / 2;
          sy = 0;
          break;
        case 'bottom':
          sx = (img.width - cropWidth) / 2;
          sy = img.height - cropHeight;
          break;
        case 'left':
          sx = 0;
          sy = (img.height - cropHeight) / 2;
          break;
        case 'right':
          sx = img.width - cropWidth;
          sy = (img.height - cropHeight) / 2;
          break;
        default:
          sx = (img.width - cropWidth) / 2;
          sy = (img.height - cropHeight) / 2;
      }

      canvas.width = cropWidth;
      canvas.height = cropHeight;
      
      ctx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), file.type || 'image/png', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setCroppedUrl(url);
    } catch (err) {
      setError('Crop failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!croppedUrl || !file) return;
    const a = document.createElement('a');
    a.href = croppedUrl;
    a.download = file.name.replace(/(\.[^.]+)$/, '-cropped$1');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setCroppedUrl(null);
    setError(null);
    setAspectRatio(1);
    setCropPosition('center');
    setZoom(100);
  };

  return (
    <ToolLayout
      title="Smart Crop"
      description="AI-powered smart cropping with preset aspect ratios and intelligent positioning"
      features={['Auto Detection', 'Aspect Ratios', 'Smart Position', 'Preview']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={croppedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Aspect Ratio</Typography>
                <ToggleButtonGroup
                  value={aspectRatio}
                  exclusive
                  onChange={(e, val) => val !== null && setAspectRatio(val)}
                  fullWidth
                  sx={{ flexWrap: 'wrap' }}
                >
                  {aspectRatios.map((ratio) => (
                    <ToggleButton key={ratio.value} value={ratio.value} sx={{ flex: '1 1 45%' }}>
                      {ratio.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>Crop Position</Typography>
                <ToggleButtonGroup
                  value={cropPosition}
                  exclusive
                  onChange={(e, val) => val && setCropPosition(val)}
                  fullWidth
                >
                  <ToggleButton value="top">Top</ToggleButton>
                  <ToggleButton value="center">Center</ToggleButton>
                  <ToggleButton value="bottom">Bottom</ToggleButton>
                  <ToggleButton value="left">Left</ToggleButton>
                  <ToggleButton value="right">Right</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Zoom: {zoom}%
                </Typography>
                <Slider
                  value={zoom}
                  onChange={(e, val) => setZoom(val as number)}
                  min={50}
                  max={150}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
            </Stack>
          </Card>

          <ActionButtons
            onReset={reset}
            onProcess={cropImage}
            onDownload={downloadImage}
            processing={processing}
            processed={!!croppedUrl}
          />
        </Stack>
      )}
    </ToolLayout>
  );
}
