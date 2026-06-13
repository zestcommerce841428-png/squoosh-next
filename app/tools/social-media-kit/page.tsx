'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

export default function SocialKitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [kit, setKit] = useState<{ name: string; url: string; size: string }[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sizes = [
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Twitter Post', width: 1200, height: 675 },
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
    { name: 'LinkedIn Banner', width: 1584, height: 396 },
  ];

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setKit([]);
    setError(null);
  };

  const generateKit = async () => {
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

      const generatedKit: { name: string; url: string; size: string }[] = [];

      for (const size of sizes) {
        const canvas = document.createElement('canvas');
        canvas.width = size.width;
        canvas.height = size.height;
        const ctx = canvas.getContext('2d')!;

        const scale = Math.max(size.width / img.width, size.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (size.width - scaledWidth) / 2;
        const y = (size.height - scaledHeight) / 2;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, size.width, size.height);
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92);
        });

        generatedKit.push({
          name: size.name,
          url: URL.createObjectURL(blob),
          size: `${size.width}×${size.height}`
        });
      }

      setKit(generatedKit);
    } catch (err) {
      setError('Kit generation failed.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    kit.forEach(({ url, name }, i) => {
      setTimeout(() => downloadImage(url, name), i * 200);
    });
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setKit([]);
    setError(null);
  };

  return (
    <ToolLayout
      title="Social Media Kit Generator"
      description="Generate complete social media kits with all platform sizes in one click"
      features={['All Platforms', '6+ Sizes', 'One Click', 'Batch Download']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {kit.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Your Social Media Kit ({kit.length} images)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {kit.map((item, i) => (
                  <Card key={i} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ flex: '0 0 200px' }}>
                        <img src={item.url} alt={item.name} style={{ width: '100%', height: 'auto' }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.size}px</Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => downloadImage(item.url, item.name)}
                      >
                        Download
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Box>
          ) : originalUrl ? (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Original" style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain' }} />
            </Card>
          ) : null}

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {kit.length === 0 ? (
              <Button variant="contained" onClick={generateKit} disabled={processing} fullWidth>
                {processing ? 'Generating Kit...' : 'Generate Social Kit'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadAll} fullWidth>
                Download All ({kit.length})
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
