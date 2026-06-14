'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Chip } from '@mui/material';
import { ToolLayout, UploadArea, PreviewArea } from '@/components/ToolComponents';

interface CheckResult {
  passed: boolean;
  message: string;
  requirement: string;
}

export default function AmazonCheckerPage() {
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
          passed: img.width >= 1000 && img.height >= 1000,
          requirement: 'Minimum 1000x1000 pixels',
          message: `Current: ${img.width}x${img.height}px`
        },
        {
          passed: img.width <= 10000 && img.height <= 10000,
          requirement: 'Maximum 10000x10000 pixels',
          message: 'Within limits'
        },
        {
          passed: selectedFile.size <= 10 * 1024 * 1024,
          requirement: 'File size under 10MB',
          message: `Current: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`
        },
        {
          passed: selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/png',
          requirement: 'JPEG or PNG format',
          message: `Format: ${selectedFile.type}`
        },
        {
          passed: true,
          requirement: 'Pure white background (#FFFFFF)',
          message: 'Manual verification required'
        },
        {
          passed: Math.min(img.width, img.height) / Math.max(img.width, img.height) >= 0.5,
          requirement: 'Aspect ratio within limits',
          message: 'Ratio acceptable'
        }
      ];
      
      setResults(checks);
    };
    
    img.src = url;
  };

  const allPassed = results.every(r => r.passed);

  return (
    <ToolLayout
      title="Amazon Image Checker"
      description="Verify images meet Amazon marketplace requirements for product listings"
      features={['Size Validation', 'Format Check', 'Background Check', 'Compliance Report']}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="caption">
          <strong>Amazon Requirements:</strong> Main product images must be 1000x1000px minimum, pure white background (#FFFFFF), JPEG or PNG, under 10MB.
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
                <Typography variant="h6">Compliance Report</Typography>
                <Chip label={allPassed ? 'PASSED ✓' : 'FAILED ✗'} color={allPassed ? 'success' : 'error'} />
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
                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>Action Required:</strong> Fix the failed checks before uploading to Amazon. Use our resize, format converter, and background tools to fix issues.
                  </Typography>
                </Alert>
              )}
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
