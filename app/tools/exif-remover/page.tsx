'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Button, Box } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function EXIFRemoverPage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      return;
    }
    
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);
    setProcessedUrl(null);
  };

  const removeEXIF = () => {
    if (!file || !originalUrl) return;

    setProcessing(true);

    const img = new Image();
    img.onload = () => {
      // Create canvas and redraw image (strips EXIF automatically)
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
        // Convert to blob without EXIF
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setProcessedUrl(url);
          }
          setProcessing(false);
        }, file.type);
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
      title="EXIF Metadata Remover"
      description="Strip all EXIF data, camera info, GPS location, and metadata for privacy protection"
      features={['Privacy Protection', 'Remove GPS Data', 'Strip Camera Info', 'Clean Metadata']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Privacy Protection Tool:</strong>
        </Typography>
        <Typography variant="caption" component="div">
          This tool removes all EXIF metadata including:<br/>
          • Camera make, model, and settings<br/>
          • GPS location coordinates<br/>
          • Date and time information<br/>
          • Software and copyright data<br/>
          <br/>
          The image is redrawn on canvas, automatically stripping all metadata while preserving visual quality.
        </Typography>
      </Alert>

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={processedUrl || originalUrl} />

          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">
                {processedUrl ? 'Metadata Removed ✓' : 'Original Image with Metadata'}
              </Typography>
              
              {!processedUrl ? (
                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>Warning:</strong> This image may contain sensitive metadata including GPS location. Click "Remove EXIF Data" to strip all metadata.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Success:</strong> All EXIF metadata has been removed. The image is now safe to share without privacy concerns.
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              {processedUrl ? 'Process Another' : 'Cancel'}
            </Button>
            {!processedUrl && (
              <Button
                variant="contained"
                onClick={removeEXIF}
                disabled={processing}
                fullWidth
              >
                {processing ? 'Removing...' : 'Remove EXIF Data'}
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
