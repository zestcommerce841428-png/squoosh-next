'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

const presets = [
  { name: 'Square', width: 400, height: 400 },
  { name: 'YouTube', width: 1280, height: 720 },
  { name: 'Blog', width: 1200, height: 630 },
  { name: 'Twitter', width: 1200, height: 675 },
];

export default function ThumbnailGeneratorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setThumbnailUrl(null);
    setError(null);
  };

  const generateThumbnail = async () => {
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

      const preset = presets[selectedPreset];
      const canvas = document.createElement('canvas');
      canvas.width = preset.width;
      canvas.height = preset.height;
      const ctx = canvas.getContext('2d')!;

      const scale = Math.max(preset.width / img.width, preset.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (preset.width - scaledWidth) / 2;
      const y = (preset.height - scaledHeight) / 2;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, preset.width, preset.height);
      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.9);
      });

      const url = URL.createObjectURL(blob);
      setThumbnailUrl(url);
    } catch (err) {
      setError('Thumbnail generation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadThumbnail = () => {
    if (!thumbnailUrl || !file) return;
    const a = document.createElement('a');
    a.href = thumbnailUrl;
    a.download = file.name.replace(/(\.[^.]+)$/, '-thumbnail.jpg');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setThumbnailUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Thumbnail Generator"
      description="Create perfect thumbnails for YouTube, blogs, and social media with preset sizes"
      features={['Multi Presets', 'Auto Crop', 'Quality Control', 'Fast Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {thumbnailUrl ? (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Generated Thumbnail</Typography>
              <img src={thumbnailUrl} alt="Thumbnail" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : originalUrl ? (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Original" style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain' }} />
            </Card>
          ) : null}

          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Select Preset</Typography>
            <ToggleButtonGroup
              value={selectedPreset}
              exclusive
              onChange={(e, val) => val !== null && setSelectedPreset(val)}
              fullWidth
            >
              {presets.map((preset, i) => (
                <ToggleButton key={i} value={i}>
                  {preset.name}<br />
                  <Typography variant="caption">{preset.width}×{preset.height}</Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!thumbnailUrl ? (
              <Button
                variant="contained"
                onClick={generateThumbnail}
                disabled={processing}
                fullWidth
              >
                {processing ? 'Generating...' : 'Generate Thumbnail'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadThumbnail} fullWidth>
                Download
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
