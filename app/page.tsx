'use client';

import Link from 'next/link';
import { Container, Typography, Box, Button, Grid, Card, Stack, Avatar, Chip, Paper } from '@mui/material';

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Squoosh Next',
    'url': 'https://squoosh-next.vercel.app',
    'description': 'Professional client-side image compression and format optimization tool supporting 100+ formats.'
  };

  return (
    <Box sx={{ width: '100%' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'background.paper', pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 }, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Chip 
                  label="100% Client-Side Image Processing" 
                  color="primary" 
                  variant="outlined"
                  sx={{ width: 'fit-content', fontWeight: 700 }}
                />
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 900, 
                    lineHeight: 1.1,
                    background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1.5px',
                    fontSize: { xs: '2.5rem', md: '3.75rem' }
                  }}
                >
                  Compress, Convert, and Polish Images Instantly
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.5 }}>
                  The professional web optimizer that runs entirely in your browser. Strip metadata, resize resolutions, and tweak settings for 100+ image formats.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                  <Button 
                    component={Link} 
                    href="/compress" 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    sx={{ px: 4, py: 1.5, fontWeight: 700 }}
                  >
                    Open Compressor Workspace
                  </Button>
                  <Button 
                    component={Link} 
                    href="/features" 
                    variant="outlined" 
                    color="primary" 
                    size="large"
                    sx={{ px: 4, py: 1.5, fontWeight: 700 }}
                  >
                    Explore Advanced Features
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            {/* Visual Grid Mockup */}
            <Grid item xs={12} md={5}>
              <Paper 
                elevation={6} 
                sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(99,102,241,0.05) 100%)',
                  border: '1px solid',
                  borderColor: 'primary.main',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                    Draggable Split Comparison Preview Demo
                  </Typography>
                </Box>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Original Size:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>4.8 MB</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">Optimized (WebP):</Typography>
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>520 KB (-89%)</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Features Grid */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ textAlignment: 'center', mb: 6, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
            Why Professionals Choose Squoosh Next
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Powered by modern WebAssembly and Canvas APIs for speed, privacy, and absolute quality control.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>100% Client-Side</Typography>
              <Typography variant="body2" color="text.secondary">
                Your images never touch a server. All operations are processed locally in your browser to guarantee confidentiality.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>100+ File Formats</Typography>
              <Typography variant="body2" color="text.secondary">
                Open PSD files, RAW camera photos, medical DICOM, scientific FITS, vector EPS/AI, and compress them to optimized web files.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Squoosh Codecs</Typography>
              <Typography variant="body2" color="text.secondary">
                Leverage advanced settings for MozJPEG, WebP, OxiPNG, and AVIF for absolute optimization.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
