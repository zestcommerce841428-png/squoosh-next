'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, MenuItem, TextField, Slider } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { canvasToBlob, downloadBlob, replaceExt, formatBytes } from '@/lib/imageTools';

const FORMATS = [
  { v: 'image/jpeg', label: 'JPEG', ext: '.jpg' },
  { v: 'image/png', label: 'PNG', ext: '.png' },
  { v: 'image/webp', label: 'WebP', ext: '.webp' },
];

export default function TiffConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState('image/png');
  const [quality, setQuality] = useState(92);

  const handleFileSelect = (f: File) => {
    if (!/\.tiff?$/i.test(f.name) && !f.type.includes('tiff')) { setError('Please choose a .tif/.tiff file.'); return; }
    setFile(f); setOutUrl(null); setOutBlob(null); setError(null); setDims(null);
  };

  const apply = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const UTIF = (await import('utif')).default;
      const buffer = await file.arrayBuffer();
      const ifds = UTIF.decode(buffer);
      if (!ifds.length) throw new Error('no images');
      UTIF.decodeImage(buffer, ifds[0]);
      const rgba = UTIF.toRGBA8(ifds[0]);
      const w = ifds[0].width, h = ifds[0].height;
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      if (format !== 'image/png') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); }
      ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), w, h), 0, 0);
      const blob = await canvasToBlob(canvas, format, format === 'image/png' ? undefined : quality / 100);
      setDims({ w, h });
      setOutBlob(blob);
      setOutUrl(URL.createObjectURL(blob));
    } catch {
      setError('Could not decode this TIFF. Some exotic compressions/colorspaces are unsupported.');
    } finally { setProcessing(false); }
  };

  const download = () => {
    if (!outBlob || !file) return;
    const ext = FORMATS.find((f) => f.v === format)?.ext || '.png';
    downloadBlob(outBlob, replaceExt(file.name, ext));
  };
  const reset = () => { setFile(null); setOutUrl(null); setOutBlob(null); setError(null); setDims(null); };

  return (
    <ToolLayout
      title="TIFF Converter"
      description="Convert TIFF/TIF scans to web-friendly PNG, JPG or WebP — decoded entirely in your browser, nothing uploaded."
      features={['TIFF Decode', 'PNG / JPG / WebP', 'Quality Control', 'No Upload']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept=".tif,.tiff,image/tiff" maxSize={50} />
      ) : (
        <Stack spacing={3}>
          {outUrl ? (
            <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
              <img src={outUrl} alt="converted" style={{ maxWidth: '100%', maxHeight: 440, objectFit: 'contain' }} />
            </Box>
          ) : (
            <Alert severity="info">Selected: <strong>{file.name}</strong> ({formatBytes(file.size)}). TIFF can&apos;t preview until converted — press Process.</Alert>
          )}
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <TextField select label="Output format" value={format} onChange={(e) => setFormat(e.target.value)} sx={{ maxWidth: 220 }}>
                {FORMATS.map((f) => <MenuItem key={f.v} value={f.v}>{f.label}</MenuItem>)}
              </TextField>
              {format !== 'image/png' && (
                <Box>
                  <Typography variant="body2">Quality: {quality}%</Typography>
                  <Slider value={quality} min={50} max={100} onChange={(_, v) => setQuality(v as number)} />
                </Box>
              )}
              {outBlob && dims && <Alert severity="success">Converted {dims.w}×{dims.h} → <strong>{formatBytes(outBlob.size)}</strong></Alert>}
            </Stack>
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
