import { Container, Typography, Box } from '@mui/material';
import ImageCompressor from 'components/ImageCompressor';

export const metadata = {
  title: 'AVIF Compressor - Squoosh Next',
  description: 'Optimize images into high-fidelity AVIF format using custom effort speed and subsampling settings.',
};

export default function AVIFCompressPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          AVIF (AV1) Optimization Workspace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure AV1 quality encoding parameters, multi-thread effort levels, and subsampling formats.
        </Typography>
      </Box>
      <ImageCompressor />
    </Container>
  );
}
