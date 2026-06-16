'use client';

import { useState } from 'react';
import {
  Card, Stack, Alert, Box, Table, TableBody, TableCell, TableHead, TableRow, Button, Typography,
} from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, formatBytes } from '@/lib/imageTools';

interface Row { quality: number; size: number; saved: number; blob: Blob; }

const QUALITIES = [90, 80, 70, 60, 50, 40];

export default function CompressionSavingsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setError(null); setFile(f); setBusy(true); setRows([]);
    try {
      const img = await fileToImage(f);
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const out: Row[] = [];
      for (const q of QUALITIES) {
        const blob = await canvasToBlob(canvas, 'image/jpeg', q / 100);
        out.push({ quality: q, size: blob.size, saved: Math.round((1 - blob.size / f.size) * 100), blob });
      }
      setRows(out);
    } catch { setError('Could not analyze this image.'); }
    finally { setBusy(false); }
  };

  const reset = () => { setFile(null); setRows([]); setError(null); };

  return (
    <ToolLayout
      title="Compression Savings Calculator"
      description="See exactly how much file size you save at each JPEG quality level — then download the one you like. Calculated in your browser."
      features={['Per-Quality Sizes', 'Live Savings %', 'Download Any', 'No Upload']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3} sx={{ maxWidth: 720, mx: 'auto' }}>
          <Alert severity="info">Original: <strong>{file.name}</strong> — {formatBytes(file.size)}</Alert>
          {busy ? <Typography>Analyzing…</Typography> : (
            <Card>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Quality</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Saved</TableCell>
                    <TableCell align="right">Download</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.quality}>
                      <TableCell>{r.quality}%</TableCell>
                      <TableCell>{formatBytes(r.size)}</TableCell>
                      <TableCell sx={{ color: r.saved > 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                        {r.saved > 0 ? `−${r.saved}%` : `+${Math.abs(r.saved)}%`}
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => downloadBlob(r.blob, file.name.replace(/\.[^.]+$/, `-q${r.quality}.jpg`))}>Get</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
          <Box><Button variant="outlined" onClick={reset}>Analyze another</Button></Box>
        </Stack>
      )}
    </ToolLayout>
  );
}
