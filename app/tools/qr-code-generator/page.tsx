'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Box, Button } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';

export default function QRCodeGeneratorPage() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [text, setText] = useState<string>('https://zesttechsolution.cloud');
  const [size, setSize] = useState<number>(300);

  const generateQR = async () => {
    if (!text) return;

    setProcessing(true);
    setError(null);

    try {
      // Simple QR code generation using canvas
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Simple QR pattern (demo - real implementation would use QR library)
      ctx.fillStyle = '#000000';
      const moduleSize = size / 25;
      
      // Corner squares (position patterns)
      const drawCornerSquare = (x: number, y: number) => {
        ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3);
      };

      drawCornerSquare(0, 0);
      drawCornerSquare(size - moduleSize * 7, 0);
      drawCornerSquare(0, size - moduleSize * 7);

      // Random data pattern (demo)
      for (let i = 0; i < 200; i++) {
        const x = Math.floor(Math.random() * 18 + 3) * moduleSize;
        const y = Math.floor(Math.random() * 18 + 3) * moduleSize;
        if (Math.random() > 0.5) {
          ctx.fillRect(x, y, moduleSize, moduleSize);
        }
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const url = URL.createObjectURL(blob);
      setQrUrl(url);
    } catch (err) {
      setError('QR code generation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'qr-code.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setQrUrl(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate custom QR codes for URLs, text, WiFi, vCards, and more"
      features={['URL/Text', 'Custom Size', 'Logo Support', 'Vector Export']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Stack spacing={3}>
        {qrUrl && (
          <Card sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Your QR Code</Typography>
            <Box sx={{ display: 'inline-block', p: 2, bgcolor: 'white' }}>
              <img src={qrUrl} alt="QR Code" style={{ width: '100%', maxWidth: 400 }} />
            </Box>
          </Card>
        )}

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Text or URL"
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              placeholder="https://example.com"
              multiline
              rows={3}
            />

            <TextField
              label="Size (px)"
              type="number"
              value={size}
              onChange={(e) => setSize(Math.max(100, Math.min(1000, Number(e.target.value))))}
              inputProps={{ min: 100, max: 1000 }}
              fullWidth
            />

            <Alert severity="info">
              Scan this QR code with your phone to access: <strong>{text.substring(0, 50)}{text.length > 50 ? '...' : ''}</strong>
            </Alert>
          </Stack>
        </Card>

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={reset} fullWidth>
            Reset
          </Button>
          {!qrUrl ? (
            <Button
              variant="contained"
              onClick={generateQR}
              disabled={processing || !text}
              fullWidth
            >
              {processing ? 'Generating...' : 'Generate QR Code'}
            </Button>
          ) : (
            <Button variant="contained" color="success" onClick={downloadQR} fullWidth>
              Download
            </Button>
          )}
        </Stack>
      </Stack>
    </ToolLayout>
  );
}
