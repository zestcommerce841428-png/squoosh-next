import { Container, Typography, Box } from '@mui/material';
import ImageCompressor from 'components/ImageCompressor';
import RequireAuth from 'components/RequireAuth';

export const metadata = {
  title: 'PDF Compressor - Squoosh Next',
  description: 'Rasterize and optimize PDF documents client-side using advanced canvas and compression controls.',
};

export default function PDFCompressPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
          PDF Rasterizer & Compressor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Extract, scale, and optimize PDF pages into high-fidelity web images client-side.
        </Typography>
      </Box>
      <RequireAuth label="the PDF compressor"><ImageCompressor /></RequireAuth>
    </Container>
  );
}
