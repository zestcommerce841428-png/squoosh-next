import { Container, Typography, Box } from '@mui/material';
import ImageCompressor from 'components/ImageCompressor';
import RequireAuth from 'components/RequireAuth';

export const metadata = {
  title: 'WebP Compressor - Squoosh Next',
  description: 'Compress and optimize WebP images using custom effort methods, lossless modes, and alpha quality controls.',
};

export default function WebPCompressPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          WebP Optimization Workspace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure alpha transparency channels, effort levels, sharp YUV filters, and lossless compression settings.
        </Typography>
      </Box>
      <RequireAuth label="the WebP compressor"><ImageCompressor /></RequireAuth>
    </Container>
  );
}
