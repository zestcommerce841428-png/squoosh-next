'use client';

import { useState, useRef } from 'react';
import { Card, Stack, Alert, Typography, Button } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function ProductWhiteBackgroundPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    setOriginalUrl(URL.createObjectURL(selectedFile));
    setProcessedUrl(null);
  };

  const applyWhiteBackground = () => {
    if (!file || !originalUrl) return;
    setProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setProcessing(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw pure white background (#FFFFFF)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw image on top
        ctx.drawImage(img, 0, 0);
        
        setProcessedUrl(canvas.toDataURL('image/jpeg', 1.0));
        setProcessing(false);
      } else {
        setProcessing(false);
      }
    };
    
    img.src = originalUrl;
  };

  const reset = () => {
    setFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
  };

  return (
    <ToolLayout
      title="Product Background White"
      description="Force transparent backgrounds to pure white (#FFFFFF) for marketplace compliance"
      features={['Pure White BG', 'Amazon/Flipkart Ready', 'Transparency Fill', 'JPEG Export']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption">
          <strong>Marketplace Requirement:</strong> Amazon, Flipkart, eBay, and most marketplaces require pure white (#FFFFFF) backgrounds for product images. This tool ensures perfect compliance.
        </Typography>
      </Alert>

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={processedUrl || originalUrl || ''} />
          
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">
                {processedUrl ? 'White Background Applied ✓' : 'Ready to Process'}
              </Typography>
              
              {!processedUrl ? (
                <Alert severity="warning">
                  <Typography variant="body2">
                    This tool will replace any transparent areas with pure white (#FFFFFF) and export as JPEG for maximum marketplace compatibility.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Marketplace Ready:</strong> Background is now pure white (#FFFFFF). Compatible with Amazon, Flipkart, eBay, Shopify, Etsy, and all major platforms.
                  </Typography>
                </Alert>
              )}

              <Alert severity="info">
                <Typography variant="caption">
                  <strong>What happens:</strong><br/>
                  • Transparent areas → Pure white (#FFFFFF)<br/>
                  • Original product preserved<br/>
                  • Exported as high-quality JPEG<br/>
                  • Perfect for marketplace listings
                </Typography>
              </Alert>
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              {processedUrl ? 'Process Another' : 'Cancel'}
            </Button>
            {!processedUrl && (
              <Button variant="contained" onClick={applyWhiteBackground} disabled={processing} fullWidth>
                {processing ? 'Processing...' : 'Apply White Background'}
              </Button>
            )}
          </Stack>
        </Stack>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </ToolLayout>
  );
}
