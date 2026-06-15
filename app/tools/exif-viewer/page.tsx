'use client';

import { useState } from 'react';
import {
  Card, Stack, Alert, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableRow, Paper, Button, Chip,
} from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';
import { formatBytes } from '@/lib/imageTools';
import { parseExif, type ExifResult } from '@/lib/exifParser';

export default function ExifViewerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [basic, setBasic] = useState<Record<string, string> | null>(null);
  const [exif, setExif] = useState<ExifResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setError(null);
    setFile(f);

    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setBasic({
        'File Name': f.name,
        'File Size': formatBytes(f.size),
        'File Type': f.type || 'unknown',
        'Dimensions': `${img.width} × ${img.height} px`,
        'Aspect Ratio': `${(img.width / img.height).toFixed(2)} : 1`,
        'Megapixels': `${((img.width * img.height) / 1e6).toFixed(2)} MP`,
        'Last Modified': new Date(f.lastModified).toLocaleString(),
      });
      URL.revokeObjectURL(url);
    };
    img.src = url;

    try {
      const buf = await f.arrayBuffer();
      setExif(parseExif(buf));
    } catch {
      setExif({ tags: {}, hasExif: false });
    }
  };

  const reset = () => { setFile(null); setBasic(null); setExif(null); setError(null); };

  const gps = exif?.tags['GPS Latitude'] && exif?.tags['GPS Longitude'];

  return (
    <ToolLayout
      title="EXIF Metadata Viewer"
      description="Read real EXIF metadata — camera, lens, exposure, ISO, date and GPS — straight from your JPEG. Parsed locally, never uploaded."
      features={['Camera & Lens', 'Exposure Data', 'GPS Location', '100% Client-Side']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          {basic && (
            <Card sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom>File Information</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {Object.entries(basic).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell sx={{ fontWeight: 600, width: '45%' }}>{k}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-all' }}>{v}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="h6">EXIF Metadata</Typography>
              <Chip
                size="small"
                color={exif?.hasExif ? 'success' : 'default'}
                label={exif?.hasExif ? 'EXIF found' : 'No EXIF data'}
              />
            </Stack>
            {exif?.hasExif ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {Object.entries(exif.tags).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell sx={{ fontWeight: 600, width: '45%' }}>{k}</TableCell>
                        <TableCell sx={{ wordBreak: 'break-all' }}>{v}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                This image has no embedded EXIF metadata. Many PNGs, screenshots, and images
                stripped by social platforms contain no EXIF — that&apos;s normal.
              </Alert>
            )}
            {gps && (
              <Button
                sx={{ mt: 2 }}
                variant="outlined"
                href={`https://www.google.com/maps?q=${exif!.lat},${exif!.lon}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                📍 View GPS location on Google Maps
              </Button>
            )}
          </Card>

          <Box>
            <Button onClick={reset} variant="contained">View Another Image</Button>
          </Box>
        </Stack>
      )}
    </ToolLayout>
  );
}
