'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Slider } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { downloadBlob, replaceExt, formatBytes } from '@/lib/imageTools';

export default function GifOptimizationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(100);
  const [colors, setColors] = useState(128);
  const [frameSkip, setFrameSkip] = useState(1);

  const handleFileSelect = (f: File) => {
    if (f.type !== 'image/gif' && !/\.gif$/i.test(f.name)) { setError('Please choose a GIF file.'); return; }
    setFile(f); setOriginalUrl(URL.createObjectURL(f)); setOutUrl(null); setOutBlob(null); setError(null);
  };

  const apply = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const { parseGIF, decompressFrames } = await import('gifuct-js');
      const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
      const buffer = await file.arrayBuffer();
      const gif = parseGIF(buffer);
      const frames = decompressFrames(gif, true);
      if (!frames.length) throw new Error('no frames');

      const fullW = gif.lsd.width, fullH = gif.lsd.height;
      const outW = Math.max(1, Math.round((fullW * scale) / 100));
      const outH = Math.max(1, Math.round((fullH * scale) / 100));

      // composite canvas at full size, then scale down to output canvas
      const comp = document.createElement('canvas'); comp.width = fullW; comp.height = fullH;
      const cctx = comp.getContext('2d')!;
      const out = document.createElement('canvas'); out.width = outW; out.height = outH;
      const octx = out.getContext('2d')!;
      const patchCanvas = document.createElement('canvas');
      const pctx = patchCanvas.getContext('2d')!;

      const enc = GIFEncoder();
      let accDelay = 0;
      frames.forEach((frame, idx) => {
        // draw this frame's patch onto the composite
        const { width, height, left, top } = frame.dims;
        patchCanvas.width = width; patchCanvas.height = height;
        pctx.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), width, height), 0, 0);
        cctx.drawImage(patchCanvas, left, top);

        accDelay += frame.delay || 100;
        if (idx % frameSkip !== 0) return; // skip frames to shrink

        octx.clearRect(0, 0, outW, outH);
        octx.imageSmoothingQuality = 'high';
        octx.drawImage(comp, 0, 0, outW, outH);
        const { data } = octx.getImageData(0, 0, outW, outH);
        const palette = quantize(data, colors);
        const index = applyPalette(data, palette);
        enc.writeFrame(index, outW, outH, { palette, delay: accDelay });
        accDelay = 0;
      });
      enc.finish();
      const blob = new Blob([enc.bytes() as BlobPart], { type: 'image/gif' });
      setOutBlob(blob);
      setOutUrl(URL.createObjectURL(blob));
    } catch {
      setError('Could not optimize this GIF. It may be malformed or unsupported.');
    } finally { setProcessing(false); }
  };

  const download = () => { if (outBlob && file) downloadBlob(outBlob, replaceExt(file.name, '-optimized.gif')); };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setOutBlob(null); setError(null); };

  const ratio = outBlob && file ? Math.round((1 - outBlob.size / file.size) * 100) : 0;

  return (
    <ToolLayout
      title="GIF Optimization"
      description="Shrink animated GIFs by scaling, reducing colors and dropping frames — fully decoded and re-encoded in your browser."
      features={['Scale Down', 'Color Reduction', 'Frame Dropping', 'Smaller GIFs']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/gif,.gif" maxSize={30} />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
            <img src={outUrl || originalUrl!} alt="gif" style={{ maxWidth: '100%', maxHeight: 400 }} />
          </Box>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2">Scale: {scale}%</Typography>
                <Slider value={scale} min={25} max={100} step={5} onChange={(_, v) => setScale(v as number)} />
              </Box>
              <Box>
                <Typography variant="body2">Colors: {colors}</Typography>
                <Slider value={colors} min={8} max={256} step={8} onChange={(_, v) => setColors(v as number)} />
              </Box>
              <Box>
                <Typography variant="body2">Keep every {frameSkip}{frameSkip === 1 ? 'st' : frameSkip === 2 ? 'nd' : frameSkip === 3 ? 'rd' : 'th'} frame</Typography>
                <Slider value={frameSkip} min={1} max={4} step={1} marks onChange={(_, v) => setFrameSkip(v as number)} />
              </Box>
              {outBlob && <Alert severity="success">Optimized: <strong>{formatBytes(outBlob.size)}</strong> — saved {ratio}% ({formatBytes(file.size)} original)</Alert>}
            </Stack>
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
