'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Chip } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

interface CheckResult {
  passed: boolean;
  message: string;
  requirement: string;
}

export default function FlipkartCheckerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [results, setResults] = useState<CheckResult[]>([]);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    
    const img = new Image();
    const url = URL.createObjectURL(selectedFile);
    
    img.onload = () => {
      setImageUrl(url);
      
      const checks: CheckResult[] = [
        {
          passed: img.width >= 500 && img.height >= 500,
          requirement: 'Minimum 500x500 pixels',
          message: `Current: ${img.width}x${img.height}px`
        },
        {
          passed: img.width === img.height,
          requirement: 'Square aspect ratio (1:1)',
          message: img.width === img.height ? '1:1 ratio' : `${img.width}:${img.height}`
        },
        {
          passed: selectedFile.size <= 5 * 1024 * 1024,
          requirement: 'File size under 5MB',
          message: `Current: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`
        },
        {
          passed: selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png',
          requirement: 'JPEG or PNG format',
          message: `Format: ${selectedFile.type}`
        },
        {
          passed: true,
          requirement: 'White or plain background',
          message: 'Visual check required'
        },
        {
          passed: true,
          requirement: 'Product should be 85% of frame',
          message: 'Visual check required'
        }
      ];
      
      setResults(checks);
    };
    
    img.src = url;
  };

  const allPassed = results.every(r => r.passed);

  return (
    <ToolLayout
      title="Flipkart Image Checker"
      description="Validate images against Flipkart marketplace listing requirements"
      features={['Size Validation', 'Aspect Ratio Check', 'Format Verification', 'Quality Report']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption">
          <strong>Flipkart Requirements:</strong> Product images must be 500x500px minimum, 1:1 square ratio, white/plain background, under 5MB, product fills 85% of frame.
        </Typography>
      </Alert>

      {!file ? (
        <UploadArea onFileSelect={handleFileSelect} accept="image/*" />
      ) : (
        <Stack spacing={3}>
          <PreviewArea imageUrl={imageUrl || ''} />
          
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Flipkart Compliance Check</Typography>
                <Chip label={allPassed ? 'APPROVED ✓' : 'REJECTED ✗'} color={allPassed ? 'success' : 'error'} />
              </Box>
              
              {results.map((result, i) => (
                <Box key={i} sx={{ p: 2, bgcolor: result.passed ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{result.requirement}</Typography>
                    <Typography variant="body2" color={result.passed ? 'success.main' : 'error.main'}>
                      {result.passed ? '✓' : '✗'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{result.message}</Typography>
                </Box>
              ))}

              {!allPassed && (
                <Alert severity="error">
                  <Typography variant="body2">
                    <strong>Listing Rejection Risk:</strong> Your image may be rejected by Flipkart. Use our tools to fix size, aspect ratio, and background issues.
                  </Typography>
                </Alert>
              )}

              <Alert severity="warning">
                <Typography variant="caption">
                  <strong>Additional Tips:</strong><br/>
                  • Product should occupy 85% of image area<br/>
                  • No watermarks or borders<br/>
                  • Good lighting, no shadows<br/>
                  • Single product per image
                </Typography>
              </Alert>
            </Stack>
          </Card>

          <button onClick={() => { setFile(null); setImageUrl(null); setResults([]); }} style={{ padding: '12px', cursor: 'pointer' }}>
            Check Another Image
          </button>
        </Stack>
      )}
    </ToolLayout>
  );
}
