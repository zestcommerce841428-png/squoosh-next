import { Container, Typography, Box } from '@mui/material';
import ImageCompressor from 'components/ImageCompressor';
import RequireAuth from 'components/RequireAuth';

export const metadata = {
  title: 'Image Compressor Workspace - Squoosh Next',
  description: 'Advanced side-by-side split screen image optimizer supporting JPEG, PNG, WebP, AVIF, HEIC, and PSD files.',
};

export default function CompressPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Squoosh Next Image Compressor',
    'operatingSystem': 'WebBrowser',
    'applicationCategory': 'MultimediaApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'description': 'Advanced side-by-side split screen image optimizer supporting JPEG, PNG, WebP, AVIF, HEIC, and PSD files.'
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          component="h1"
          variant="h3"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1.5,
            letterSpacing: '-0.5px',
          }}
        >
          Optimization Workspace
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontWeight: 500 }}>
          Configure advanced codec parameters, resize dimensions, and adjustments client-side.
        </Typography>
      </Box>

      <RequireAuth label="the compression workspace">
        <ImageCompressor />
      </RequireAuth>
    </Container>
  );
}
