'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';

export default function CollageMakerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [collageUrl, setCollageUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<string>('grid');
  const [gap, setGap] = useState<number>(10);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length < 2) {
      setError('Please select at least 2 images');
      return;
    }
    setFiles(selectedFiles);
    const urls = selectedFiles.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    setCollageUrl(null);
    setError(null);
  };

  const createCollage = async () => {
    if (files.length < 2) return;

    setProcessing(true);
    setError(null);

    try {
      const images = await Promise.all(
        previews.map(url => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = reject;
          });
        })
      );

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const cols = Math.ceil(Math.sqrt(images.length));
      const rows = Math.ceil(images.length / cols);
      const cellSize = 400;
      
      canvas.width = cols * cellSize + (cols - 1) * gap;
      canvas.height = rows * cellSize + (rows - 1) * gap;

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      images.forEach((img, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * (cellSize + gap);
        const y = row * (cellSize + gap);

        // Scale image to fit cell
        const scale = Math.min(cellSize / img.width, cellSize / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (cellSize - scaledWidth) / 2;
        const offsetY = (cellSize - scaledHeight) / 2;

        ctx.drawImage(img, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setCollageUrl(url);
    } catch (err) {
      setError('Collage creation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!collageUrl) return;
    const a = document.createElement('a');
    a.href = collageUrl;
    a.download = 'collage.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setCollageUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Collage Maker"
      description="Create beautiful photo collages with multiple images and custom layouts"
      features={['Multiple Layouts', 'Gap Control', 'Auto Arrange', 'HD Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {files.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', border: '2px dashed', borderColor: 'primary.main' }}>
          <Typography variant="h6" gutterBottom>
            Select Images for Collage
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose 2 or more images to create a collage
          </Typography>
          <Button variant="contained" component="label" sx={{ mt: 2 }}>
            Choose Images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFilesSelect}
            />
          </Button>
        </Card>
      ) : (
        <Stack spacing={3}>
          {collageUrl ? (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Your Collage</Typography>
              <img src={collageUrl} alt="Collage" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Selected Images ({files.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {previews.slice(0, 6).map((url, i) => (
                  <Card key={i} sx={{ p: 1, flex: '1 1 150px', maxWidth: 200 }}>
                    <img src={url} alt={`Image ${i + 1}`} style={{ width: '100%', height: 'auto' }} />
                  </Card>
                ))}
                {previews.length > 6 && (
                  <Card sx={{ p: 1, flex: '1 1 150px', maxWidth: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6">+{previews.length - 6} more</Typography>
                  </Card>
                )}
              </Box>
            </Box>
          )}

          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Layout</Typography>
                <ToggleButtonGroup
                  value={layout}
                  exclusive
                  onChange={(e, val) => val && setLayout(val)}
                  fullWidth
                >
                  <ToggleButton value="grid">Grid</ToggleButton>
                  <ToggleButton value="masonry">Masonry</ToggleButton>
                  <ToggleButton value="freeform">Freeform</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <TextField
                label="Gap Between Images (px)"
                type="number"
                value={gap}
                onChange={(e) => setGap(Math.max(0, Number(e.target.value)))}
                inputProps={{ min: 0, max: 50 }}
                fullWidth
              />
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!collageUrl ? (
              <Button
                variant="contained"
                onClick={createCollage}
                disabled={processing}
                fullWidth
              >
                {processing ? 'Creating...' : 'Create Collage'}
              </Button>
            ) : (
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
