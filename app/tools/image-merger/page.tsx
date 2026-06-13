'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';

export default function ImageMergerPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length < 2) {
      setError('Please select at least 2 images');
      return;
    }
    setFiles(selectedFiles);
    const urls = selectedFiles.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    setMergedUrl(null);
    setError(null);
  };

  const mergeImages = async () => {
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

      if (direction === 'horizontal') {
        canvas.width = images.reduce((sum, img) => sum + img.width, 0);
        canvas.height = Math.max(...images.map(img => img.height));
        
        let x = 0;
        images.forEach(img => {
          ctx.drawImage(img, x, 0);
          x += img.width;
        });
      } else {
        canvas.width = Math.max(...images.map(img => img.width));
        canvas.height = images.reduce((sum, img) => sum + img.height, 0);
        
        let y = 0;
        images.forEach(img => {
          ctx.drawImage(img, 0, y);
          y += img.height;
        });
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
    } catch (err) {
      setError('Merge failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!mergedUrl) return;
    const a = document.createElement('a');
    a.href = mergedUrl;
    a.download = 'merged-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFiles([]);
    setPreviews([]);
    setMergedUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Image Merger"
      description="Combine multiple images into one horizontal or vertical collage"
      features={['Multi-Image', 'H/V Layout', 'Auto Align', 'High Quality']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {files.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', border: '2px dashed', borderColor: 'primary.main' }}>
          <Typography variant="h6" gutterBottom>
            Select Multiple Images
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose 2 or more images to merge together
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
          {mergedUrl ? (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Merged Image</Typography>
              <img src={mergedUrl} alt="Merged" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Selected Images ({files.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {previews.map((url, i) => (
                  <Card key={i} sx={{ p: 1, flex: '1 1 200px', maxWidth: 250 }}>
                    <img src={url} alt={`Image ${i + 1}`} style={{ width: '100%', height: 'auto' }} />
                    <Typography variant="caption" textAlign="center" display="block">
                      Image {i + 1}
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Merge Direction</Typography>
            <ToggleButtonGroup
              value={direction}
              exclusive
              onChange={(e, val) => val && setDirection(val)}
              fullWidth
            >
              <ToggleButton value="horizontal">→ Horizontal</ToggleButton>
              <ToggleButton value="vertical">↓ Vertical</ToggleButton>
            </ToggleButtonGroup>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!mergedUrl ? (
              <Button
                variant="contained"
                onClick={mergeImages}
                disabled={processing}
                fullWidth
              >
                {processing ? 'Merging...' : 'Merge Images'}
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
