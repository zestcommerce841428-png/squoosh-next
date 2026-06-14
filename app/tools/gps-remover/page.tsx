'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Button, Box } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

export default function GPSRemoverPage() {
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

  const removeGPS = () => {
    if (!file || !originalUrl) return;

    setProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        
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
      title="GPS Data Remover"
      description="Remove GPS location coordinates and geotags from photos for location privacy"
      features={['Location Privacy', 'GPS Stripping', 'Geotag Removal', 'Safe Sharing']}
    >
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Location Privacy Protection:</strong>
        </Typography>
        <Typography variant="caption" component="div">
          Photos taken with smartphones often contain GPS coordinates showing:<br/>
          • Exact latitude and longitude<br/>
          • Address where photo was taken<br/>
          • Altitude and timestamp<br/>
          <br/>
          This tool removes all GPS data while preserving the image. Essential before sharing photos publicly.
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
                {processedUrl ? 'GPS Data Removed ✓' : 'Checking for GPS Data...'}
              </Typography>
              
              {!processedUrl ? (
                <Alert severity="error">
                  <Typography variant="body2">
                    <strong>Privacy Risk:</strong> This photo may contain GPS coordinates revealing your location. Remove GPS data before sharing online.
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="success">
                  <Typography variant="body2">
                    <strong>Protected:</strong> All GPS location data has been removed. Your location is now private.
                  </Typography>
                </Alert>
              )}

              <Alert severity="info">
                <Typography variant="caption">
                  <strong>What is removed:</strong><br/>
                  • GPS Latitude / Longitude<br/>
                  • GPS Altitude<br/>
                  • GPS Timestamp<br/>
                  • GPS Processing Method<br/>
                  • GPS Map Datum
                </Typography>
              </Alert>
            </Stack>
          </Card>

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={reset} fullWidth>
              {processedUrl ? 'Process Another' : 'Cancel'}
            </Button>
            {!processedUrl && (
              <Button
                variant="contained"
                onClick={removeGPS}
                disabled={processing}
                fullWidth
                color="error"
              >
                {processing ? 'Removing GPS...' : 'Remove GPS Data Now'}
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </ToolLayout>
  );
}
