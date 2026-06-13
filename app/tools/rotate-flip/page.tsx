'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Button, Typography, Box, ButtonGroup } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea, ActionButtons } from '@/components/ToolComponents';

export default function RotateFlipPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setTransformedUrl(null);
    setError(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const applyTransform = async () => {
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

      const radians = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      
      canvas.width = img.width * cos + img.height * sin;
      canvas.height = img.width * sin + img.height * cos;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(radians);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), file.type || 'image/png', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setTransformedUrl(url);
    } catch (err) {
      setError('Transform failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRotate = (degrees: number) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  const downloadImage = () => {
    if (!transformedUrl || !file) return;
    const a = document.createElement('a');
    a.href = transformedUrl;
    a.download = file.name.replace(/(\.[^.]+)$/, '-transformed$1');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setTransformedUrl(null);
    setError(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  return (
    <ToolLayout
      title="Rotate & Flip"
      description="Rotate images by any angle and flip horizontally or vertically with precision"
      features={['Free Rotation', 'Flip H/V', 'No Quality Loss', 'Preview']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={transformedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Rotation: {rotation}°
                </Typography>
                <ButtonGroup variant="outlined" fullWidth>
                  <Button onClick={() => handleRotate(-90)}>
                    ↶ 90° Left
                  </Button>
                  <Button onClick={() => handleRotate(90)}>
                    ↷ 90° Right
                  </Button>
                  <Button onClick={() => handleRotate(180)}>
                    180°
                  </Button>
                </ButtonGroup>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Flip
                </Typography>
                <ButtonGroup variant="outlined" fullWidth>
                  <Button
                    onClick={() => setFlipH(!flipH)}
                    variant={flipH ? 'contained' : 'outlined'}
                  >
                    ↔ Horizontal {flipH && '✓'}
                  </Button>
                  <Button
                    onClick={() => setFlipV(!flipV)}
                    variant={flipV ? 'contained' : 'outlined'}
                  >
                    ↕ Vertical {flipV && '✓'}
                  </Button>
                </ButtonGroup>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Tip:</strong> Apply multiple transformations before processing for best results
                </Typography>
              </Box>
            </Stack>
          </Card>

          <ActionButtons
            onReset={reset}
            onProcess={applyTransform}
            onDownload={downloadImage}
            processing={processing}
            processed={!!transformedUrl}
          />
        </Stack>
      )}
    </ToolLayout>
  );
}
