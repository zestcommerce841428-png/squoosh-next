'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Slider } from '@mui/material';
import { ToolLayout, UploadArea, ActionButtons } from '@/components/ToolComponents';
import { fileToImage, canvasToBlob, downloadBlob, replaceExt } from '@/lib/imageTools';

export interface SliderControl {
  key: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
  suffix?: string;
}

interface FilterToolProps {
  title: string;
  description: string;
  features: string[];
  controls: SliderControl[];
  /** Draw the processed result onto `canvas` from source `img` using `params`. */
  process: (canvas: HTMLCanvasElement, img: HTMLImageElement, params: Record<string, number>) => void;
  /** Output mime, default image/png. */
  outputType?: string;
  outputQuality?: number;
  outputExt?: string;
}

export default function FilterTool({
  title, description, features, controls, process,
  outputType = 'image/png', outputQuality, outputExt = '.png',
}: FilterToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, number>>(
    Object.fromEntries(controls.map((c) => [c.key, c.default])),
  );

  const handleFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose an image.'); return; }
    setFile(f); setOriginalUrl(URL.createObjectURL(f)); setOutUrl(null); setError(null);
  };

  const apply = async () => {
    if (!file) return;
    setProcessing(true); setError(null);
    try {
      const img = await fileToImage(file);
      const canvas = document.createElement('canvas');
      process(canvas, img, params);
      const blob = await canvasToBlob(canvas, outputType, outputQuality);
      setOutUrl(URL.createObjectURL(blob));
    } catch {
      setError('Processing failed. Try a different image.');
    } finally {
      setProcessing(false);
    }
  };

  const download = async () => {
    if (!outUrl || !file) return;
    const res = await fetch(outUrl);
    downloadBlob(await res.blob(), replaceExt(file.name, '-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + outputExt));
  };

  const reset = () => { setFile(null); setOriginalUrl(null); setOutUrl(null); setError(null); };

  return (
    <ToolLayout title={title} description={description} features={features}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: outUrl ? '1fr 1fr' : '1fr' }, gap: 2 }}>
            <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
              <Typography variant="caption" color="text.secondary">{outUrl ? 'Before' : 'Original'}</Typography>
              <Box><img src={originalUrl!} alt="original" style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain' }} /></Box>
            </Box>
            {outUrl && (
              <Box sx={{ textAlign: 'center', bgcolor: 'action.hover', borderRadius: 1, p: 1 }}>
                <Typography variant="caption" color="text.secondary">After</Typography>
                <Box><img src={outUrl} alt="result" style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain' }} /></Box>
              </Box>
            )}
          </Box>

          {controls.length > 0 && (
            <Card sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2}>
                {controls.map((c) => (
                  <Box key={c.key}>
                    <Typography variant="body2">{c.label}: {params[c.key]}{c.suffix || ''}</Typography>
                    <Slider
                      value={params[c.key]}
                      min={c.min}
                      max={c.max}
                      step={c.step || 1}
                      onChange={(_, v) => setParams((p) => ({ ...p, [c.key]: v as number }))}
                    />
                  </Box>
                ))}
              </Stack>
            </Card>
          )}

          <ActionButtons onReset={reset} onProcess={apply} onDownload={download} processing={processing} processed={!!outUrl} />
        </Stack>
      )}
    </ToolLayout>
  );
}
