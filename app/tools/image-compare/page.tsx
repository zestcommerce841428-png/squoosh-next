'use client';

import { useState } from 'react';
import { Card, Stack, Alert, Typography, Box, Slider, Button } from '@mui/material';
import { ToolLayout } from '@/components/ToolComponents';

export default function ImageComparePage() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [url1, setUrl1] = useState<string | null>(null);
  const [url2, setUrl2] = useState<string | null>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [error, setError] = useState<string | null>(null);

  const handleFile1Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile1(file);
      setUrl1(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleFile2Select = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile2(file);
      setUrl2(URL.createObjectURL(file));
      setError(null);
    }
  };

  const reset = () => {
    setFile1(null);
    setFile2(null);
    setUrl1(null);
    setUrl2(null);
    setSliderPosition(50);
    setError(null);
  };

  return (
    <ToolLayout
      title="Image Comparison Tool"
      description="Compare two images side-by-side with interactive slider for before/after comparisons"
      features={['Side-by-Side', 'Slider View', 'Difference View', 'Zoom']}
    >
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {!url1 || !url2 ? (
        <Stack spacing={3}>
          <Card sx={{ p: 4, textAlign: 'center', border: '2px dashed', borderColor: 'primary.main' }}>
            <Typography variant="h6" gutterBottom>
              Select First Image
            </Typography>
            <Button variant="contained" component="label" sx={{ mt: 2 }}>
              Choose Image 1
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFile1Select}
              />
            </Button>
            {url1 && (
              <Box sx={{ mt: 2 }}>
                <img src={url1} alt="Image 1" style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
              </Box>
            )}
          </Card>

          <Card sx={{ p: 4, textAlign: 'center', border: '2px dashed', borderColor: 'secondary.main' }}>
            <Typography variant="h6" gutterBottom>
              Select Second Image
            </Typography>
            <Button variant="contained" component="label" sx={{ mt: 2 }} color="secondary">
              Choose Image 2
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFile2Select}
              />
            </Button>
            {url2 && (
              <Box sx={{ mt: 2 }}>
                <img src={url2} alt="Image 2" style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }} />
              </Box>
            )}
          </Card>
        </Stack>
      ) : (
        <Stack spacing={3}>
          <Card sx={{ p: 2, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'relative', width: '100%', height: 500 }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${url1})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${url2})`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: `${sliderPosition}%`,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  bgcolor: 'primary.main',
                  cursor: 'ew-resize',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                  }
                }}
              />
            </Box>
          </Card>

          <Card sx={{ p: 3 }}>
            <Typography variant="body2" gutterBottom>
              Comparison Slider: {sliderPosition}%
            </Typography>
            <Slider
              value={sliderPosition}
              onChange={(e, val) => setSliderPosition(val as number)}
              min={0}
              max={100}
              valueLabelDisplay="auto"
            />
          </Card>

          <Button variant="outlined" onClick={reset} fullWidth>
            Reset & Compare New Images
          </Button>
        </Stack>
      )}
    </ToolLayout>
  );
}
