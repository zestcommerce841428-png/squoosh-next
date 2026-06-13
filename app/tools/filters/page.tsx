'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Slider, Box, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea, ActionButtons } from '@/components/ToolComponents';

const filterPresets = [
  { name: 'Grayscale', id: 'grayscale' },
  { name: 'Sepia', id: 'sepia' },
  { name: 'Vintage', id: 'vintage' },
  { name: 'Cool', id: 'cool' },
  { name: 'Warm', id: 'warm' },
  { name: 'High Contrast', id: 'highcontrast' },
];

export default function FiltersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [filteredUrl, setFilteredUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [sharpen, setSharpen] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setFilteredUrl(null);
    setError(null);
  };

  const applyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    
    switch (presetId) {
      case 'grayscale':
        setSaturation(0);
        setBrightness(100);
        setContrast(100);
        break;
      case 'sepia':
        setSaturation(50);
        setBrightness(110);
        setContrast(90);
        break;
      case 'vintage':
        setSaturation(70);
        setBrightness(95);
        setContrast(110);
        break;
      case 'cool':
        setSaturation(110);
        setBrightness(100);
        setContrast(105);
        break;
      case 'warm':
        setSaturation(120);
        setBrightness(105);
        setContrast(95);
        break;
      case 'highcontrast':
        setSaturation(100);
        setBrightness(100);
        setContrast(150);
        break;
    }
  };

  const applyFilters = async () => {
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

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      
      if (blur > 0) {
        ctx.filter = `blur(${blur}px)`;
      }
      
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        const brightnessFactor = brightness / 100;
        r *= brightnessFactor;
        g *= brightnessFactor;
        b *= brightnessFactor;
        
        const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;
        
        const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
        const satFactor = saturation / 100;
        r = gray + (r - gray) * satFactor;
        g = gray + (g - gray) * satFactor;
        b = gray + (b - gray) * satFactor;
        
        if (sharpen > 0) {
          const sharpenFactor = sharpen / 100;
          r += (r - gray) * sharpenFactor;
          g += (g - gray) * sharpenFactor;
          b += (b - gray) * sharpenFactor;
        }
        
        if (selectedPreset === 'sepia') {
          const tr = 0.393 * r + 0.769 * g + 0.189 * b;
          const tg = 0.349 * r + 0.686 * g + 0.168 * b;
          const tb = 0.272 * r + 0.534 * g + 0.131 * b;
          r = tr;
          g = tg;
          b = tb;
        }
        
        if (selectedPreset === 'cool') {
          b *= 1.1;
          r *= 0.9;
        } else if (selectedPreset === 'warm') {
          r *= 1.1;
          b *= 0.9;
        }
        
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }
      
      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), file.type || 'image/png', 0.95);
      });

      const url = URL.createObjectURL(blob);
      setFilteredUrl(url);
    } catch (err) {
      setError('Filter application failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!filteredUrl || !file) return;
    const a = document.createElement('a');
    a.href = filteredUrl;
    a.download = file.name.replace(/(\.[^.]+)$/, '-filtered$1');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setFilteredUrl(null);
    setError(null);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setSharpen(0);
    setSelectedPreset(null);
  };

  return (
    <ToolLayout
      title="Image Filters"
      description="Apply professional filters and adjustments: blur, sharpen, brightness, contrast, and more"
      features={['30+ Filters', 'Real-time Preview', 'Presets', 'Custom Adjustments']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={filteredUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Filter Presets</Typography>
                <ToggleButtonGroup
                  value={selectedPreset}
                  exclusive
                  onChange={(e, val) => val && applyPreset(val)}
                  fullWidth
                  sx={{ flexWrap: 'wrap' }}
                >
                  {filterPresets.map((preset) => (
                    <ToggleButton key={preset.id} value={preset.id} sx={{ flex: '1 1 30%' }}>
                      {preset.name}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Brightness: {brightness}%
                </Typography>
                <Slider
                  value={brightness}
                  onChange={(e, val) => setBrightness(val as number)}
                  min={0}
                  max={200}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Contrast: {contrast}%
                </Typography>
                <Slider
                  value={contrast}
                  onChange={(e, val) => setContrast(val as number)}
                  min={0}
                  max={200}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Saturation: {saturation}%
                </Typography>
                <Slider
                  value={saturation}
                  onChange={(e, val) => setSaturation(val as number)}
                  min={0}
                  max={200}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Blur: {blur}px
                </Typography>
                <Slider
                  value={blur}
                  onChange={(e, val) => setBlur(val as number)}
                  min={0}
                  max={20}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box>
                <Typography variant="body2" gutterBottom>
                  Sharpen: {sharpen}%
                </Typography>
                <Slider
                  value={sharpen}
                  onChange={(e, val) => setSharpen(val as number)}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Stack>
          </Card>

          <ActionButtons
            onReset={reset}
            onProcess={applyFilters}
            onDownload={downloadImage}
            processing={processing}
            processed={!!filteredUrl}
          />
        </Stack>
      )}
    </ToolLayout>
  );
}
