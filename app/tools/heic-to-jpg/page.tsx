'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function HeicToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [quality, setQuality] = useState(92);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);

  const bgColorOptions = [
    { value: '#FFFFFF', label: 'White' },
    { value: '#000000', label: 'Black' },
    { value: '#FF0000', label: 'Red' },
    { value: '#00FF00', label: 'Green' },
    { value: '#0000FF', label: 'Blue' },
    { value: '#FFFF00', label: 'Yellow' },
  ];

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.type.includes('heic') && !selectedFile.name.toLowerCase().endsWith('.heic') && !selectedFile.name.toLowerCase().endsWith('.heif')) {
      setError('Please upload a HEIC/HEIF file (commonly from iPhone/iPad)');
      return;
    }
    
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    
    // Note: HEIC decoding requires special handling or library
    // For now, we'll use a placeholder that shows the limitation
    setError('HEIC decoding requires a WebAssembly library. Converting via server-side processing or using a HEIC decoder library like heic2any.js is recommended.');
    
    // Attempt to create object URL for browsers that support HEIC
    try {
      const url = URL.createObjectURL(selectedFile);
      setOriginalUrl(url);
      setConvertedUrl(null);
    } catch (err) {
      setError('HEIC file loaded. Click Convert to attempt conversion.');
    }
  };

  const convertImage = async () => {
    if (!file) return;

    setProcessing(true);
    setError('HEIC decoding requires a specialized library. For production use, integrate heic2any or libheif-wasm library.');

    try {
      // Note: This is a placeholder implementation
      // Real HEIC conversion requires heic2any library or libheif-wasm
      
      // For demonstration, we'll show how it would work with heic2any:
      // const heic2any = await import('heic2any');
      // const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: quality / 100 });
      
      // Placeholder: Show error message
      throw new Error('HEIC decoder not integrated. Please use heic2any or libheif-wasm library.');
      
    } catch (err) {
      console.error(err);
      setError(
        'HEIC conversion not yet implemented. To add HEIC support: ' +
        '1) Install heic2any library (npm install heic2any), or ' +
        '2) Integrate libheif-wasm for full HEIC/HEIF support, or ' +
        '3) Use a server-side conversion API.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!convertedUrl || !file) return;
    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = file.name.replace(/\.(heic|heif)$/i, '.jpg');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setConvertedUrl(null);
    setError(null);
    setOriginalSize(0);
    setConvertedSize(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const sizeDiff = originalSize && convertedSize 
    ? Math.round((convertedSize / originalSize - 1) * 100)
    : 0;

  return (
    <ToolLayout
      title="HEIC to JPG Converter"
      description="Convert Apple HEIC/HEIF photos from iPhone/iPad to universal JPEG format for maximum compatibility"
      features={['iPhone Photos', 'Universal Compatibility', 'Quality Control', 'Easy Sharing']}
    >
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>HEIC Decoder Required:</strong>
        </Typography>
        <Typography variant="caption" component="div">
          HEIC conversion requires a specialized WebAssembly decoder. To enable this feature:<br/>
          • Install <strong>heic2any</strong> library: <code>npm install heic2any</code><br/>
          • Or integrate <strong>libheif-wasm</strong> for full HEIC support<br/>
          • Or use server-side conversion with libheif/ImageMagick<br/>
          <br/>
          This is a placeholder implementation showing the UI structure.
        </Typography>
      </Alert>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept=".heic,.heif,image/heic,image/heif" />
      ) : (
        <Stack spacing={3}>
          {originalUrl && <PreviewArea imageUrl={originalUrl} />}

          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
                  Quality Settings
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Quality: {quality}%
                </Typography>
                <Slider
                  value={quality}
                  onChange={(_, value) => setQuality(value as number)}
                  min={60}
                  max={100}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => setQuality(85)}>
                    Good (85%)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setQuality(92)}>
                    High (92%)
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => setQuality(98)}>
                    Max (98%)
                  </Button>
                </Stack>
              </Box>

              <Box>
                <FormControl fullWidth>
                  <InputLabel>Background Color</InputLabel>
                  <Select
                    value={backgroundColor}
                    label="Background Color"
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  >
                    {bgColorOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              bgcolor: option.value,
                              border: '1px solid #ccc',
                              borderRadius: 0.5,
                            }}
                          />
                          <Typography>{option.label}</Typography>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Transparent areas will be replaced with this color
                </Typography>
              </Box>

              {convertedUrl && (
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="h6" color="success.dark" gutterBottom>
                    ✓ Conversion Complete
                  </Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      Original (HEIC): {formatFileSize(originalSize)}
                    </Typography>
                    <Typography variant="body2">
                      Converted (JPG): {formatFileSize(convertedSize)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      File size {sizeDiff > 0 ? 'increased' : 'decreased'} by {Math.abs(sizeDiff)}%
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Alert severity="info">
                <Typography variant="body2" gutterBottom>
                  <strong>About HEIC Format:</strong>
                </Typography>
                <Typography variant="caption" component="div">
                  • <strong>Apple's Format:</strong> Default on iPhone/iPad since iOS 11<br/>
                  • <strong>Great Compression:</strong> 50% smaller than JPEG with same quality<br/>
                  • <strong>Limited Support:</strong> Not widely supported outside Apple ecosystem<br/>
                  • <strong>Why Convert:</strong> Share photos with Android/Windows users, email attachments, social media
                </Typography>
              </Alert>

              <Alert severity="success">
                <Typography variant="body2">
                  <strong>Implementation Guide:</strong> To enable HEIC conversion, add one of these libraries:
                </Typography>
                <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                  <strong>Option 1 - heic2any (easiest):</strong><br/>
                  <code>npm install heic2any</code><br/>
                  Then: <code>await heic2any({`{ blob: file, toType: 'image/jpeg', quality: 0.92 }`})</code><br/>
                  <br/>
                  <strong>Option 2 - libheif-wasm (full featured):</strong><br/>
                  <code>npm install libheif-js</code><br/>
                  Provides complete HEIC/HEIF decoding with metadata preservation<br/>
                  <br/>
                  <strong>Option 3 - Server-side:</strong><br/>
                  Use ImageMagick or libheif on your server for batch processing
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
              onClick={convertImage}
              disabled={processing}
              fullWidth
            >
              {processing ? 'Converting...' : 'Convert to JPG (Not Implemented)'}
            </Button>
            {convertedUrl && (
              <Button variant="contained" color="success" onClick={downloadImage} fullWidth>
                Download JPG
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
