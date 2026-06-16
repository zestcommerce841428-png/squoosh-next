'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, TextField, MenuItem } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, replaceExt } from '@/lib/imageTools';

const COMMON = [72, 96, 150, 200, 300, 600];

/** Write DPI into a JPEG's JFIF APP0 density fields. */
function setJpegDpi(buf: ArrayBuffer, dpi: number): Blob {
  const bytes = new Uint8Array(buf);
  // SOI = FFD8, APP0 = FFE0 at offset 2 for canvas-produced JPEGs
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff && bytes[3] === 0xe0) {
    bytes[13] = 1; // density units: dots per inch
    bytes[14] = (dpi >> 8) & 0xff; // Xdensity high
    bytes[15] = dpi & 0xff;        // Xdensity low
    bytes[16] = (dpi >> 8) & 0xff; // Ydensity high
    bytes[17] = dpi & 0xff;        // Ydensity low
  }
  return new Blob([bytes as BlobPart], { type: 'image/jpeg' });
}

export default function DpiChangerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dpi, setDpi] = useState(300);

  const handleFileSelect = async (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setFile(f); setOriginalUrl(URL.createObjectURL(f)); setOutBlob(null); setError(null);
    const img = await fileToImage(f);
    setDims({ w: img.width, h: img.height });
  };

  const apply = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const img = await fileToImage(file);
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const jpeg = await canvasToBlob(canvas, 'image/jpeg', 0.95);
      setOutBlob(setJpegDpi(await jpeg.arrayBuffer(), dpi));
    } catch {
      setError('Failed to set DPI.');
    } finally { setProcessing(false); }
  };

  const download = () => { if (outBlob && file) downloadBlob(outBlob, replaceExt(file.name, `-${dpi}dpi.jpg`)); };
  const reset = () => { setFile(null); setOriginalUrl(null); setOutBlob(null); setError(null); setDims(null); };

  const inches = dims ? { w: (dims.w / dpi).toFixed(2), h: (dims.h / dpi).toFixed(2) } : null;
  const cm = dims ? { w: ((dims.w / dpi) * 2.54).toFixed(2), h: ((dims.h / dpi) * 2.54).toFixed(2) } : null;

  return (
    <ToolLayout
      title="DPI Changer"
      description="Set the print resolution (DPI) embedded in your image and see the resulting physical print size. Processed in your browser."
      features={['Set Any DPI', 'Print Size Preview', 'JPEG Output', 'No Upload']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
            <img src={originalUrl!} alt="preview" style={{ maxWidth: '100%', maxHeight: 360, objectFit: 'contain' }} />
          </Box>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2.5}>
              <TextField
                select label="Target DPI" value={dpi}
                onChange={(e) => setDpi(Number(e.target.value))}
                helperText="300 DPI is standard for print; 72–96 for screen"
                sx={{ maxWidth: 260 }}
              >
                {COMMON.map((d) => <MenuItem key={d} value={d}>{d} DPI</MenuItem>)}
              </TextField>
              {dims && inches && cm && (
                <Alert severity="info">
                  <Typography variant="body2">Pixels: <strong>{dims.w} × {dims.h}</strong></Typography>
                  <Typography variant="body2">At {dpi} DPI → <strong>{inches.w}″ × {inches.h}″</strong> ({cm.w} × {cm.h} cm)</Typography>
                </Alert>
              )}
            </Stack>
          </Card>
          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outBlob} />
        </Stack>
      )}
    </ToolLayout>
  );
}
