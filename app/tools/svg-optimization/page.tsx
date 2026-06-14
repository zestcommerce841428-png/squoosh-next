'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, FormControlLabel, Checkbox, Slider } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function SvgOptimizationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSvg, setOriginalSvg] = useState<string>('');
  const [optimizedSvg, setOptimizedSvg] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [removeComments, setRemoveComments] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [removeHiddenElements, setRemoveHiddenElements] = useState(true);
  const [simplifyPaths, setSimplifyPaths] = useState(true);
  const [precision, setPrecision] = useState<number>(2);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.includes('svg')) {
      setError('Please upload an SVG file');
      return;
    }
    
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    
    const text = await selectedFile.text();
    setOriginalSvg(text);
    setOptimizedSvg('');
    setError(null);
    
    const blob = new Blob([text], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    setPreviewUrl(url);
  };

  const removeSvgComments = (svg: string): string => {
    return svg.replace(/<!--[\s\S]*?-->/g, '');
  };

  const removeSvgMetadata = (svg: string): string => {
    return svg
      .replace(/<metadata[\s\S]*?<\/metadata>/gi, '')
      .replace(/<title[\s\S]*?<\/title>/gi, '')
      .replace(/<desc[\s\S]*?<\/desc>/gi, '');
  };

  const removeHiddenSvgElements = (svg: string): string => {
    return svg
      .replace(/<[^>]+display\s*=\s*["']none["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '')
      .replace(/<[^>]+visibility\s*=\s*["']hidden["'][^>]*>[\s\S]*?<\/[^>]+>/gi, '');
  };

  const simplifySvgPaths = (svg: string, decimals: number): string => {
    const regex = /(\d+\.\d+)/g;
    return svg.replace(regex, (match) => {
      return parseFloat(match).toFixed(decimals);
    });
  };

  const minifySvg = (svg: string): string => {
    return svg
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s*([:;{}])\s*/g, '$1')
      .trim();
  };

  const optimizeSvg = async () => {
    if (!originalSvg) return;

    setProcessing(true);
    setError(null);

    try {
      let optimized = originalSvg;

      if (removeComments) {
        optimized = removeSvgComments(optimized);
      }

      if (removeMetadata) {
        optimized = removeSvgMetadata(optimized);
      }

      if (removeHiddenElements) {
        optimized = removeHiddenSvgElements(optimized);
      }

      if (simplifyPaths) {
        optimized = simplifySvgPaths(optimized, precision);
      }

      optimized = minifySvg(optimized);

      setOptimizedSvg(optimized);
      
      const blob = new Blob([optimized], { type: 'image/svg+xml' });
      setOptimizedSize(blob.size);

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
      setError('SVG optimization failed. Please try another file.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadSvg = () => {
    if (!optimizedSvg || !file) return;
    const blob = new Blob([optimizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.svg$/i, '-optimized.svg');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setOriginalSvg('');
    setOptimizedSvg('');
    setPreviewUrl(null);
    setError(null);
    setOriginalSize(0);
    setOptimizedSize(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  const savings = originalSize && optimizedSize 
    ? Math.round((1 - optimizedSize / originalSize) * 100)
    : 0;

  return (
    <ToolLayout
      title="SVG Optimization"
      description="Compress SVG files by up to 80%. Remove metadata, simplify paths, and minify code"
      features={['Path Simplification', 'Metadata Strip', 'Code Minification', 'SVGO-based']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept=".svg,image/svg+xml" />
      ) : (
        <Stack spacing={3}>
          {previewUrl && <PreviewArea imageUrl={previewUrl} />}

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Optimization Options
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={removeComments} 
                      onChange={(e) => setRemoveComments(e.target.checked)} 
                    />
                  }
                  label="Remove Comments"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={removeMetadata} 
                      onChange={(e) => setRemoveMetadata(e.target.checked)} 
                    />
                  }
                  label="Remove Metadata"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={removeHiddenElements} 
                      onChange={(e) => setRemoveHiddenElements(e.target.checked)} 
                    />
                  }
                  label="Remove Hidden Elements"
                />
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={simplifyPaths} 
                      onChange={(e) => setSimplifyPaths(e.target.checked)} 
                    />
                  }
                  label="Simplify Paths"
                />
              </Box>

              {simplifyPaths && (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Number Precision: {precision} decimals
                  </Typography>
                  <Slider
                    value={precision}
                    onChange={(_, value) => setPrecision(value as number)}
                    min={0}
                    max={5}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              )}

              {optimizedSvg && (
                <Box sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="secondary.dark" gutterBottom>
                    📐 SVG Optimization Results
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original: {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2">
                      Optimized: {formatFileSize(optimizedSize)}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="secondary.dark">
                      Saved: {savings}% ({formatFileSize(originalSize - optimizedSize)})
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2">
                  <strong>SVG Optimization:</strong> Path simplification, metadata removal, and code minification
                </Typography>
              </Alert>
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={optimizeSvg}
              disabled={processing || !originalSvg}
              fullWidth
            >
              {processing ? 'Optimizing...' : 'Optimize SVG'}
            </Button>
            {optimizedSvg && (
              <Button variant="contained" color="success" onClick={downloadSvg} fullWidth>
                Download
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
