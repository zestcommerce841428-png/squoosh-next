import { Container, Typography, Box } from '@mui/material';
import ImageCompressor from 'components/ImageCompressor';

export const metadata = {
  title: 'PNG Compressor - Squoosh Next',
  description: 'Compress PNG files client-side using OxiPNG optimization levels and interlacing.',
};

export default function PNGCompressPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          OxiPNG Optimization Workspace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure interlacing, custom quantization, and optimization levels to compress lossless PNGs.
        </Typography>
      </Box>
      <ImageCompressor />
    </Container>
  );
}
