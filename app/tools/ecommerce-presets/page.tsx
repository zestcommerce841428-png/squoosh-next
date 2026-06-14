'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Button, Grid, Chip } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

interface EcomPreset {
  name: string;
  marketplace: string;
  width: number;
  height: number;
  minWidth?: number;
  description: string;
  requirement: string;
}

const ECOM_PRESETS: EcomPreset[] = [
  { name: 'Amazon Main Image', marketplace: 'Amazon', width: 2000, height: 2000, minWidth: 1000, description: 'Product main photo', requirement: 'Pure white background required' },
  { name: 'Amazon Lifestyle', marketplace: 'Amazon', width: 1600, height: 1600, description: 'Lifestyle shot', requirement: 'Optional white background' },
  { name: 'Amazon A+ Content', marketplace: 'Amazon', width: 970, height: 600, description: 'Enhanced brand content', requirement: 'Banner format' },
  { name: 'eBay Main Photo', marketplace: 'eBay', width: 1600, height: 1600, description: 'Square product photo', requirement: 'Min 500px recommended' },
  { name: 'eBay Gallery', marketplace: 'eBay', width: 1200, height: 1200, description: 'Gallery thumbnail', requirement: 'Square format' },
  { name: 'Etsy Listing', marketplace: 'Etsy', width: 2000, height: 2000, description: 'Product photo', requirement: 'Min 2000px one side' },
  { name: 'Etsy Shop Banner', marketplace: 'Etsy', width: 3360, height: 840, description: 'Shop header', requirement: 'Wide banner' },
  { name: 'Shopify Product', marketplace: 'Shopify', width: 2048, height: 2048, description: 'Product image', requirement: 'Max 4472×4472px' },
  { name: 'Shopify Collection', marketplace: 'Shopify', width: 1200, height: 630, description: 'Collection banner', requirement: 'Wide format' },
  { name: 'Walmart Main Image', marketplace: 'Walmart', width: 2000, height: 2000, minWidth: 1000, description: 'Primary product', requirement: 'White background' },
  { name: 'Flipkart Main', marketplace: 'Flipkart', width: 1000, height: 1000, minWidth: 500, description: 'Product photo', requirement: 'Min 500px' },
  { name: 'Alibaba Product', marketplace: 'Alibaba', width: 800, height: 800, description: 'Product listing', requirement: 'Square preferred' },
];

export default function EcommercePresetsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<EcomPreset | null>(null);
  
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

  const applyPreset = async (preset: EcomPreset) => {
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

      // For marketplace images, use contain mode with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, preset.width, preset.height);

      const scale = Math.min(preset.width / img.width, preset.height / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (preset.width - scaledWidth) / 2;
      const offsetY = (preset.height - scaledHeight) / 2;
      
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

      // Always use JPEG for marketplace compliance
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95);
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
    const presetName = selectedPreset.name.toLowerCase().replace(/\s+/g, '-');
    a.download = file.name.replace(/\.(jpg|jpeg|png|webp)$/i, `_${presetName}.jpg`);
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

  const marketplaceColors: Record<string, string> = {
    'Amazon': '#FF9900',
    'eBay': '#E53238',
    'Etsy': '#F56400',
    'Shopify': '#96BF48',
    'Walmart': '#0071CE',
    'Flipkart': '#2874F0',
    'Alibaba': '#FF6A00',
  };

  return (
    <ToolLayout
      title="Ecommerce Presets"
      description="Resize images for Amazon, eBay, Etsy, Shopify and other marketplace compliance"
      features={['Marketplace Compliance', 'White Background', 'Optimal Dimensions', '12+ Presets']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          {resizedUrl && <PreviewArea imageUrl={resizedUrl} />}

          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Select Marketplace
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {ECOM_PRESETS.map((preset, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      cursor: 'pointer',
                      border: selectedPreset?.name === preset.name ? 2 : 0,
                      borderColor: 'primary.main',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => applyPreset(preset)}
                  >
                    <Chip 
                      label={preset.marketplace} 
                      size="small" 
                      sx={{ 
                        mb: 1,
                        bgcolor: marketplaceColors[preset.marketplace] || 'primary.main',
                        color: '#fff',
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
                    {preset.minWidth && (
                      <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                        Min: {preset.minWidth}px
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                      {preset.requirement}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {selectedPreset && resizedUrl && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="h6" color="success.dark" gutterBottom>
                  ✓ Marketplace Ready - {selectedPreset.name}
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    Marketplace: {selectedPreset.marketplace}
                  </Typography>
                  <Typography variant="body2">
                    Dimensions: {selectedPreset.width} × {selectedPreset.height}px
                  </Typography>
                  <Typography variant="body2">
                    Format: JPEG (marketplace standard)
                  </Typography>
                  <Typography variant="body2">
                    Background: White (#FFFFFF)
                  </Typography>
                  <Typography variant="body2">
                    File Size: {formatFileSize(resizedSize)}
                  </Typography>
                </Stack>
              </Box>
            )}

            <Alert severity="warning" sx={{ mt: 3 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Marketplace Requirements:</strong>
              </Typography>
              <Typography variant="caption" component="div">
                • <strong>Amazon/Walmart:</strong> Main images must have pure white background (#FFFFFF)<br/>
                • <strong>Image Size:</strong> Most require minimum 1000px on longest side<br/>
                • <strong>File Format:</strong> JPEG or PNG accepted, JPEG recommended for products<br/>
                • <strong>File Size:</strong> Keep under 10MB for faster uploads<br/>
                • Always check specific marketplace guidelines before uploading
              </Typography>
            </Alert>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Pro Tips:</strong>
              </Typography>
              <Typography variant="caption" component="div">
                • Use high-quality source images (at least 2000px)<br/>
                • Product should fill 85% of frame for best visibility<br/>
                • White background ensures marketplace compliance<br/>
                • Test on mobile - most shoppers browse on phones
              </Typography>
            </Alert>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              Upload New Image
            </Button>
            {resizedUrl && (
              <Button variant="contained" color="success" onClick={downloadImage} fullWidth>
                Download {selectedPreset?.marketplace} Image
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
