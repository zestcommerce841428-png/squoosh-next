'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, Stack, Alert, Typography, Box, TextField, Slider, Button } from '@mui/material';
import QRCode from 'qrcode';
import { ToolLayout } from '@/components/ToolComponents';
import { useAuth } from '@/lib/supabase/AuthProvider';

export default function QrCodeGeneratorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [text, setText] = useState('https://zesttechsolution.cloud');
  const [size, setSize] = useState(320);
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !text) return;
    QRCode.toCanvas(canvasRef.current, text, {
      width: size,
      margin: 2,
      color: { dark: fg, light: bg },
      errorCorrectionLevel: 'M',
    }).then(() => setError(null)).catch(() => setError('Could not generate QR code for this input.'));
  }, [text, size, fg, bg]);

  const download = () => {
    if (loading) return;
    if (!user) { router.push(`/auth/login?next=${encodeURIComponent(pathname || '/')}`); return; }
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    a.href = canvasRef.current.toDataURL('image/png');
    a.download = 'qr-code.png';
    a.click();
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Create a high-quality QR code for any link or text, with custom colors and size. Generated in your browser."
      features={['Any URL or Text', 'Custom Colors', 'High Resolution', 'PNG Download']}
    >
      <Stack spacing={3} sx={{ maxWidth: 820, mx: 'auto' }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <TextField label="Content (URL or text)" fullWidth multiline minRows={2} value={text} onChange={(e) => setText(e.target.value)} />
              <Box>
                <Typography variant="body2">Size: {size}px</Typography>
                <Slider value={size} min={128} max={1024} step={32} onChange={(_, v) => setSize(v as number)} />
              </Box>
              <Stack direction="row" spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Dots</Typography>
                  <input aria-label="Foreground color" type="color" value={fg} onChange={(e) => setFg(e.target.value)} style={{ width: 44, height: 38, border: 'none', background: 'none' }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">Background</Typography>
                  <input aria-label="Background color" type="color" value={bg} onChange={(e) => setBg(e.target.value)} style={{ width: 44, height: 38, border: 'none', background: 'none' }} />
                </Box>
              </Stack>
            </Stack>
          </Card>
          <Card sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ maxWidth: '100%', overflow: 'auto' }}>
              <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
            </Box>
            <Button variant="contained" onClick={download} fullWidth>Download PNG</Button>
          </Card>
        </Box>
      </Stack>
    </ToolLayout>
  );
}
