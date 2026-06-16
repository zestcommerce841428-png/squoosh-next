'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Box, Typography, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';
import { fileToImage } from '@/lib/imageTools';

function toData(img: HTMLImageElement, w: number, h: number): Uint8ClampedArray {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data;
}

function luma(d: Uint8ClampedArray, i: number) {
  return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
}

export default function ImageQualityAnalyzerPage() {
  const [a, setA] = useState<File | null>(null);
  const [b, setB] = useState<File | null>(null);
  const [result, setResult] = useState<{ psnr: number; ssim: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const analyze = async () => {
    if (!a || !b) return;
    setBusy(true); setError(null);
    try {
      const ia = await fileToImage(a);
      const ib = await fileToImage(b);
      const w = Math.min(ia.width, ib.width);
      const h = Math.min(ia.height, ib.height);
      const da = toData(ia, w, h);
      const db = toData(ib, w, h);

      // PSNR over RGB
      let mse = 0;
      for (let i = 0; i < da.length; i += 4) {
        for (let c = 0; c < 3; c++) { const d = da[i + c] - db[i + c]; mse += d * d; }
      }
      mse /= (da.length / 4) * 3;
      const psnr = mse === 0 ? Infinity : 10 * Math.log10((255 * 255) / mse);

      // Global SSIM over luma
      let muA = 0, muB = 0, n = 0;
      for (let i = 0; i < da.length; i += 4) { muA += luma(da, i); muB += luma(db, i); n++; }
      muA /= n; muB /= n;
      let vA = 0, vB = 0, cov = 0;
      for (let i = 0; i < da.length; i += 4) {
        const la = luma(da, i) - muA, lb = luma(db, i) - muB;
        vA += la * la; vB += lb * lb; cov += la * lb;
      }
      vA /= n - 1; vB /= n - 1; cov /= n - 1;
      const c1 = (0.01 * 255) ** 2, c2 = (0.03 * 255) ** 2;
      const ssim = ((2 * muA * muB + c1) * (2 * cov + c2)) / ((muA * muA + muB * muB + c1) * (vA + vB + c2));

      setResult({ psnr, ssim });
    } catch { setError('Could not analyze. Make sure both files are valid images.'); }
    finally { setBusy(false); }
  };

  const reset = () => { setA(null); setB(null); setResult(null); setError(null); };

  return (
    <ToolLayout
      title="Image Quality Analyzer"
      description="Compare two versions of an image and measure objective quality — PSNR and SSIM — between them. Computed entirely in your browser."
      features={['PSNR', 'SSIM', 'Objective Metrics', 'No Upload']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Stack spacing={3} sx={{ maxWidth: 760, mx: 'auto' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Original / reference</Typography>
            {a ? <Alert severity="success">{a.name}</Alert> : <UploadArea onFileSelect={setA} />}
          </Box>
          <Box>
            <Typography variant="subtitle2" gutterBottom>Compressed / modified</Typography>
            {b ? <Alert severity="success">{b.name}</Alert> : <UploadArea onFileSelect={setB} />}
          </Box>
        </Box>

        {result && (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} justifyContent="center">
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }} color="primary">{result.psnr === Infinity ? '∞' : result.psnr.toFixed(2)} dB</Typography>
                <Typography color="text.secondary">PSNR — higher is better (&gt;40 dB excellent)</Typography>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800 }} color="primary">{result.ssim.toFixed(4)}</Typography>
                <Typography color="text.secondary">SSIM — 1.0 is identical</Typography>
              </Box>
            </Stack>
          </Card>
        )}

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={reset} fullWidth>Reset</Button>
          <Button variant="contained" onClick={analyze} disabled={!a || !b || busy} fullWidth>{busy ? 'Analyzing…' : 'Analyze quality'}</Button>
        </Stack>
      </Stack>
    </ToolLayout>
  );
}
