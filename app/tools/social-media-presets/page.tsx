'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Grid, Chip } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

interface SocialPreset {
  name: string;
  platform: string;
  width: number;
  height: number;
  description: string;
}

const SOCIAL_PRESETS: SocialPreset[] = [
  { name: 'Instagram Post', platform: 'Instagram', width: 1080, height: 1080, description: 'Square post' },
  { name: 'Instagram Story', platform: 'Instagram', width: 1080, height: 1920, description: 'Vertical story' },
  { name: 'Instagram Reels', platform: 'Instagram', width: 1080, height: 1920, description: 'Vertical video cover' },
  { name: 'Facebook Post', platform: 'Facebook', width: 1200, height: 630, description: 'Link preview' },
  { name: 'Facebook Cover', platform: 'Facebook', width: 820, height: 312, description: 'Profile cover' },
  { name: 'Facebook Event', platform: 'Facebook', width: 1920, height: 1080, description: 'Event image' },
  { name: 'Twitter Post', platform: 'Twitter', width: 1200, height: 675, description: 'In-stream photo' },
  { name: 'Twitter Header', platform: 'Twitter', width: 1500, height: 500, description: 'Profile banner' },
  { name: 'LinkedIn Post', platform: 'LinkedIn', width: 1200, height: 627, description: 'Shared image' },
  { name: 'LinkedIn Cover', platform: 'LinkedIn', width: 1584, height: 396, description: 'Profile background' },
  { name: 'YouTube Thumbnail', platform: 'YouTube', width: 1280, height: 720, description: 'Video cover' },
  { name: 'YouTube Channel Art', platform: 'YouTube', width: 2560, height: 1440, description: 'Banner image' },
  { name: 'Pinterest Pin', platform: 'Pinterest', width: 1000, height: 1500, description: 'Standard pin' },
  { name: 'TikTok Video', platform: 'TikTok', width: 1080, height: 1920, description: 'Vertical video' },
  { name: 'Snapchat Geofilter', platform: 'Snapchat', width: 1080, height: 1920, description: 'Custom filter' },
];

export default function SocialMediaPresetsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<SocialPreset | null>(null);
  
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [resizedSize, setResizedSize] = useState<number>(0);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setFile(selectedFile);
    setOriginalSize(selectedFile.size);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setResizedUrl(null);
    setError(null);
    setSelectedPreset(null);
  };

  const applyPreset = async (preset: SocialPreset) => {
    if (!file || !originalUrl) return;

    setProcessing(true);
    setError(null);
    setSelectedPreset(preset);

    try {
      const img = new Image();
      img.src = originalUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = preset.width;
      canvas.height = preset.height;
      const ctx = canvas.getContext('2d')!;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Cover mode: fill canvas, crop if needed
      const scale = Math.max(preset.width / img.width, preset.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (preset.width - scaledWidth) / 2;
      const offsetY = (preset.height - scaledHeight) / 2;
      
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      const mimeType = file.type;
      const quality = mimeType === 'image/jpeg' ? 0.92 : undefined;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), mimeType, quality);
      });

      setResizedSize(blob.size);
      const url = URL.createObjectURL(blob);
      setResizedUrl(url);
    } catch (err) {
      console.error(err);
      setError('Resize failed. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resizedUrl || !file || !selectedPreset) return;
    const a = document.createElement('a');
    a.href = resizedUrl;
    const ext = file.name.split('.').pop();
    const presetName = selectedPreset.name.toLowerCase().replace(/\s+/g, '-');
    a.download = file.name.replace(new RegExp(`\\.${ext}$`), `_${presetName}.${ext}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setResizedUrl(null);
    setError(null);
    setOriginalSize(0);
    setResizedSize(0);
    setSelectedPreset(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const platformColors: Record<string, string> = {
    'Instagram': '#E4405F',
    'Facebook': '#1877F2',
    'Twitter': '#1DA1F2',
    'LinkedIn': '#0A66C2',
    'YouTube': '#FF0000',
    'Pinterest': '#E60023',
    'TikTok': '#000000',
    'Snapchat': '#FFFC00',
  };

  return (
    <ToolLayout
      title="Social Media Presets"
      description="Resize images to perfect dimensions for Instagram, Facebook, Twitter, YouTube, and more"
      features={['15+ Platform Presets', 'One-Click Resize', 'Cover Crop Mode', 'Optimized Dimensions']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          {resizedUrl && <PreviewArea imageUrl={resizedUrl} />}

          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Select Social Media Platform
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {SOCIAL_PRESETS.map((preset) => (
                <Grid item xs={12} sm={6} md={4} key={`${preset.platform}-${preset.name}`}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      border: selectedPreset?.name === preset.name ? 2 : 0,
                      borderColor: 'primary.main',
                      '&:hover': { bgcolor: 'action.hover' },
                      position: 'relative'
                    }}
                    onClick={() => applyPreset(preset)}
                  >
                    <Chip 
                      label={preset.platform} 
                      size="small" 
                      sx={{ 
                        mb: 1,
                        bgcolor: platformColors[preset.platform] || 'primary.main',
                        color: preset.platform === 'Snapchat' ? '#000' : '#fff',
                        fontWeight: 600
                      }} 
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {preset.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {preset.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: 'primary.main', fontWeight: 600 }}>
                      {preset.width} × {preset.height}px
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {selectedPreset && resizedUrl && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="h6" color="success.dark" gutterBottom>
                  ✓ Resize Complete - {selectedPreset.name}
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    Platform: {selectedPreset.platform}
                  </Typography>
                  <Typography variant="body2">
                    Dimensions: {selectedPreset.width} × {selectedPreset.height}px
                  </Typography>
                  <Typography variant="body2">
                    Original: {formatFileSize(originalSize)}
                  </Typography>
                  <Typography variant="body2">
                    Resized: {formatFileSize(resizedSize)}
                  </Typography>
                </Stack>
              </Box>
            )}

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Platform-Optimized Sizing:</strong>
              </Typography>
              <Typography variant="caption" component="div">
                • All dimensions follow official platform specifications<br/>
                • Images are cropped to fill (cover mode) for best presentation<br/>
                • Click any preset to instantly resize your image<br/>
                • Perfect for social media managers and content creators
              </Typography>
            </Alert>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Upload New Image
            </Button>
            {resizedUrl && (
              <Button variant="contained" color="success" onClick={downloadImage} fullWidth>
                Download {selectedPreset?.name}
              </Button>
            )}
          </Stack>

          {processing && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Processing...
              </Typography>
            </Box>
          )}
        </Stack>
      )}
    </ToolLayout>
  );
}
