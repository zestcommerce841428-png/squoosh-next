'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Table, TableBody, TableCell, TableRow, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

export default function MetadataViewerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setMetadata(null);
    setError(null);
  };

  const extractMetadata = async () => {
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

      const meta = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        fileType: file.type,
        dimensions: `${img.width} × ${img.height} px`,
        width: img.width,
        height: img.height,
        aspectRatio: (img.width / img.height).toFixed(2),
        megapixels: ((img.width * img.height) / 1000000).toFixed(2) + ' MP',
        lastModified: new Date(file.lastModified).toLocaleString(),
      };

      setMetadata(meta);
    } catch (err) {
      setError('Metadata extraction failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setMetadata(null);
    setError(null);
  };

  return (
    <ToolLayout
      title="Image Metadata Viewer"
      description="View and extract EXIF data, dimensions, file size, and other metadata from images"
      features={['EXIF Data', 'Dimensions', 'File Info', 'Export Data']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {originalUrl && (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Preview" style={{ width: '100%', height: 'auto', maxHeight: 400, objectFit: 'contain' }} />
            </Card>
          )}

          {metadata && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Image Metadata
              </Typography>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell><strong>File Name</strong></TableCell>
                    <TableCell>{metadata.fileName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>File Size</strong></TableCell>
                    <TableCell>{metadata.fileSize}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>File Type</strong></TableCell>
                    <TableCell>{metadata.fileType}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Dimensions</strong></TableCell>
                    <TableCell>{metadata.dimensions}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Aspect Ratio</strong></TableCell>
                    <TableCell>{metadata.aspectRatio}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Megapixels</strong></TableCell>
                    <TableCell>{metadata.megapixels}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Last Modified</strong></TableCell>
                    <TableCell>{metadata.lastModified}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          )}

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!metadata ? (
              <Button
                variant="contained"
                onClick={extractMetadata}
                disabled={processing}
                fullWidth
              >
                {processing ? 'Reading...' : 'Read Metadata'}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  const text = Object.entries(metadata)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');
                  navigator.clipboard.writeText(text);
                }}
                fullWidth
              >
                Copy Metadata
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
