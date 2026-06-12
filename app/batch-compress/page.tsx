import { Container, Typography, Box } from '@mui/material';
import ImageCompressor from 'components/ImageCompressor';

export const metadata = {
  title: 'Batch Image Compressor - Squoosh Next',
  description: 'Compress and optimize multiple images simultaneously client-side with Squoosh Next.',
};

export default function BatchCompressPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          Batch Optimization Workspace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Import multiple files at once. Configure shared formatting presets and download compressed outputs concurrently.
        </Typography>
      </Box>
      <ImageCompressor />
    </Container>
  );
}
