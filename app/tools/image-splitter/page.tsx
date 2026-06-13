'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, TextField, Box, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';

export default function ImageSplitterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splits, setSplits] = useState<string[]>([]);
  
  const [rows, setRows] = useState<number>(2);
  const [cols, setCols] = useState<number>(2);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setSplits([]);
    setError(null);
  };

  const splitImage = async () => {
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

      const pieceWidth = Math.floor(img.width / cols);
      const pieceHeight = Math.floor(img.height / rows);
      const splitUrls: string[] = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const canvas = document.createElement('canvas');
          canvas.width = pieceWidth;
          canvas.height = pieceHeight;
          const ctx = canvas.getContext('2d')!;

          ctx.drawImage(
            img,
            col * pieceWidth,
            row * pieceHeight,
            pieceWidth,
            pieceHeight,
            0,
            0,
            pieceWidth,
            pieceHeight
          );

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), file.type || 'image/png', 0.95);
          });

          splitUrls.push(URL.createObjectURL(blob));
        }
      }

      setSplits(splitUrls);
    } catch (err) {
      setError('Split failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadAll = () => {
    splits.forEach((url, index) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `split-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setSplits([]);
    setError(null);
  };

  return (
    <ToolLayout
      title="Image Splitter"
      description="Split images into multiple pieces for Instagram grids, puzzles, or tiled displays"
      features={['Grid Split', 'Custom Rows/Cols', 'Batch Download', 'Instagram Ready']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          {originalUrl && !splits.length && (
            <Card sx={{ p: 2 }}>
              <img src={originalUrl} alt="Original" style={{ width: '100%', height: 'auto' }} />
            </Card>
          )}

          {splits.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Split Result ({splits.length} pieces)
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gap: 1,
                }}
              >
                {splits.map((url, i) => (
                  <Card key={i} sx={{ p: 1 }}>
                    <img src={url} alt={`Split ${i + 1}`} style={{ width: '100%', height: 'auto' }} />
                    <Typography variant="caption" textAlign="center" display="block">
                      Part {i + 1}
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Rows"
                type="number"
                value={rows}
                onChange={(e) => setRows(Math.max(1, Number(e.target.value)))}
                inputProps={{ min: 1, max: 10 }}
                fullWidth
              />
              <TextField
                label="Columns"
                type="number"
                value={cols}
                onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
                inputProps={{ min: 1, max: 10 }}
                fullWidth
              />
              <Typography variant="caption" color="text.secondary">
                Total pieces: {rows * cols}
              </Typography>
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            {!splits.length ? (
              <Button
                variant="contained"
                onClick={splitImage}
                disabled={processing}
                fullWidth
              >
                {processing ? 'Splitting...' : 'Split Image'}
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={downloadAll} fullWidth>
                Download All ({splits.length})
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
