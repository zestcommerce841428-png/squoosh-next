'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

const faviconSizes = [16, 32, 48, 64, 128, 256];

export default function FaviconGeneratorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [favicons, setFavicons] = useState<{ size: number; url: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setFavicons([]);
    setError(null);
  };

  const generateFavicons = async () => {
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

      const generatedFavicons: { size: number; url: string }[] = [];

      for (const size of selectedSizes) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, size, size);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });

        generatedFavicons.push({
          size,
          url: URL.createObjectURL(blob)
        });
      }

      setFavicons(generatedFavicons);
    } catch (err) {
      setError('Favicon generation failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadFavicon = (url: string, size: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `favicon-${size}x${size}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    favicons.forEach(({ url, size }) => {
      setTimeout(() => downloadFavicon(url, size), 100 * size);
    });
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setFavicons([]);
    setError(null);
  };

  return (
    <ToolLayout
      title="Favicon Generator"
      description="Generate favicons in all required sizes for websites and web apps"
      features={['All Sizes', 'ICO Format', 'PNG Format', 'Apple Touch']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {favicons.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Generated Favicons ({favicons.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {favicons.map(({ size, url }) => (
                  <Card key={size} sx={{ p: 2, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 128,
                        height: 128,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'background.default',
                        mb: 1
                      }}
                    >
                      <img src={url} alt={`${size}x${size}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    </Box>
                    <Typography variant="body2">{size}×{size}px</Typography>
                    <Button
                      size="small"
                      onClick={() => downloadFavicon(url, size)}
                      sx={{ mt: 1 }}
                    >
                      Download
                    </Button>
                  </Card>
                ))}
              </Box>
            </Box>
          ) : originalUrl ? (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Original" style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }} />
            </Card>
          ) : null}

          {originalUrl && (
            <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Select Sizes to Generate
            </Typography>
            <ToggleButtonGroup
              value={selectedSizes}
              onChange={(e, val) => val.length > 0 && setSelectedSizes(val)}
              sx={{ flexWrap: 'wrap' }}
            >
              {faviconSizes.map((size) => (
                <ToggleButton key={size} value={size}>
                  {size}×{size}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            </Card>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {favicons.length === 0 ? (
              <Button
                variant="contained"
                onClick={generateFavicons}
                disabled={processing || selectedSizes.length === 0}
                fullWidth
              >
                {processing ? 'Generating...' : 'Generate Favicons'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadAll} fullWidth>
                Download All ({favicons.length})
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
