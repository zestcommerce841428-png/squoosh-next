'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Box, Typography, LinearProgress, List, ListItem, ListItemText, Button } from '@mui/material';
import { ToolLayout, UploadArea } from '@/components/ToolComponents';
import { fileToImage, formatBytes } from '@/lib/imageTools';

interface Report { score: number; rows: { k: string; v: string }[]; tips: string[]; }

export default function PerformanceScorePage() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setError(null);
    try {
      const img = await fileToImage(f);
      const pixels = img.width * img.height;
      const bpp = f.size / pixels; // bytes per pixel
      const type = f.type || 'unknown';
      const tips: string[] = [];
      let score = 100;

      if (f.size > 500 * 1024) { score -= 25; tips.push('File is over 500 KB — compress it for faster loading.'); }
      else if (f.size > 200 * 1024) { score -= 10; tips.push('Consider compressing below 200 KB for web.'); }
      if (bpp > 2) { score -= 20; tips.push('High bytes-per-pixel — quality is likely higher than needed.'); }
      if (Math.max(img.width, img.height) > 2500) { score -= 15; tips.push('Very large dimensions — resize to the size actually displayed.'); }
      if (type === 'image/png' && bpp > 1.5) { score -= 10; tips.push('This PNG is heavy — try WebP/AVIF or JPEG for photos.'); }
      if (type === 'image/bmp' || type === 'image/tiff') { score -= 20; tips.push('Uncompressed format — convert to WebP/AVIF/JPEG.'); }
      if (!['image/webp', 'image/avif'].includes(type)) tips.push('Modern formats (WebP/AVIF) are typically 25–50% smaller.');
      if (tips.length === 0) tips.push('This image is already well optimized. 🎉');
      score = Math.max(5, Math.min(100, score));

      setReport({
        score,
        rows: [
          { k: 'File size', v: formatBytes(f.size) },
          { k: 'Dimensions', v: `${img.width} × ${img.height}` },
          { k: 'Megapixels', v: `${(pixels / 1e6).toFixed(2)} MP` },
          { k: 'Format', v: type },
          { k: 'Bytes / pixel', v: bpp.toFixed(2) },
        ],
        tips,
      });
    } catch { setError('Could not analyze this image.'); }
  };

  const color = report ? (report.score >= 80 ? 'success' : report.score >= 50 ? 'warning' : 'error') : 'primary';

  return (
    <ToolLayout
      title="Image Performance Score"
      description="Audit any image for web performance — get a score, key metrics and concrete optimization tips. Analyzed in your browser."
      features={['Performance Score', 'Key Metrics', 'Optimization Tips', 'No Upload']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!report ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3} sx={{ maxWidth: 680, mx: 'auto' }}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 800 }} color={`${color}.main`}>{report.score}</Typography>
            <Typography color="text.secondary">Performance score / 100</Typography>
            <LinearProgress variant="determinate" value={report.score} color={color} sx={{ height: 10, borderRadius: 5, mt: 2 }} />
          </Card>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" gutterBottom>Metrics</Typography>
            {report.rows.map((r) => (
              <Box key={r.k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">{r.k}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.v}</Typography>
              </Box>
            ))}
          </Card>
          <Card sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6">Recommendations</Typography>
            <List dense>{report.tips.map((t, i) => <ListItem key={i}><ListItemText primary={`• ${t}`} /></ListItem>)}</List>
          </Card>
          <Box><Button variant="outlined" onClick={() => setReport(null)}>Analyze another</Button></Box>
        </Stack>
      )}
    </ToolLayout>
  );
}
