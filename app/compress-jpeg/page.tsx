import { Container, Typography, Box } from '@mui/material';
import ImageCompressor from 'components/ImageCompressor';
import RequireAuth from 'components/RequireAuth';

export const metadata = {
  title: 'JPEG Compressor - Squoosh Next',
  description: 'Compress JPEG images client-side using advanced MozJPEG compression parameters.',
};

export default function JPEGCompressPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          MozJPEG Optimization Workspace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure progressive rendering, trellis quantization, and custom subsampling to output optimal JPEGs.
        </Typography>
      </Box>
      <RequireAuth label="the JPEG compressor"><ImageCompressor /></RequireAuth>
    </Container>
  );
}
