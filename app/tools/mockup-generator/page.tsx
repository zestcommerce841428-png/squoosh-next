'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

const mockupTypes = [
  { name: 'Phone', width: 375, height: 812 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Laptop', width: 1440, height: 900 },
];

export default function MockupGeneratorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [mockupUrl, setMockupUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMockup, setSelectedMockup] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setMockupUrl(null);
    setError(null);
  };

  const generateMockup = async () => {
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

      const mockup = mockupTypes[selectedMockup];
      const canvas = document.createElement('canvas');
      const padding = 100;
      canvas.width = mockup.width + padding * 2;
      canvas.height = mockup.height + padding * 2;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Device frame
      ctx.fillStyle = '#000000';
      ctx.roundRect(padding - 20, padding - 20, mockup.width + 40, mockup.height + 40, 20);
      ctx.fill();

      // Screen
      const scale = Math.min(mockup.width / img.width, mockup.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = padding + (mockup.width - scaledWidth) / 2;
      const y = padding + (mockup.height - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const url = URL.createObjectURL(blob);
      setMockupUrl(url);
    } catch (err) {
      setError('Mockup generation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadMockup = () => {
    if (!mockupUrl) return;
    const a = document.createElement('a');
    a.href = mockupUrl;
    a.download = `mockup-${mockupTypes[selectedMockup].name.toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setMockupUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Mockup Generator"
      description="Create professional device mockups for presentations and portfolios"
      features={['Multiple Devices', 'Realistic Frames', 'High Quality', 'Instant Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {mockupUrl ? (
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Your Mockup</Typography>
              <img src={mockupUrl} alt="Mockup" style={{ width: '100%', height: 'auto' }} />
            </Card>
          ) : originalUrl ? (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Original" style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain' }} />
            </Card>
          ) : null}

          <Card sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Select Device</Typography>
            <ToggleButtonGroup
              value={selectedMockup}
              exclusive
              onChange={(e, val) => val !== null && setSelectedMockup(val)}
              fullWidth
            >
              {mockupTypes.map((mockup, i) => (
                <ToggleButton key={i} value={i}>
                  {mockup.name}<br />
                  <Typography variant="caption">{mockup.width}×{mockup.height}</Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!mockupUrl ? (
              <Button variant="contained" onClick={generateMockup} disabled={processing} fullWidth>
                {processing ? 'Generating...' : 'Generate Mockup'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadMockup} fullWidth>
                Download
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
