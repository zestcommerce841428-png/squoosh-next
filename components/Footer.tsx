'use client';

import Link from 'next/link';
import { Container, Grid, Typography, Stack, Box, Divider } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                  Squoosh Next
                </Typography>
              </Link>
              <Typography variant="body2" color="text.secondary">
                Professional client-side image compression and format optimization tool. Compress, convert, and adjust 100+ formats instantly without server uploads.
              </Typography>
            </Stack>
          </Grid>

          {/* Tools */}
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
              Optimizers
            </Typography>
            <Stack spacing={1.5}>
              <Link href="/compress-jpeg" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>JPEG Compressor</Typography>
              </Link>
              <Link href="/compress-png" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>PNG Compressor</Typography>
              </Link>
              <Link href="/compress-webp" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>WebP Compressor</Typography>
              </Link>
              <Link href="/compress-avif" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>AVIF Compressor</Typography>
              </Link>
              <Link href="/compress-pdf" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>PDF Compressor</Typography>
              </Link>
              <Link href="/batch-compress" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Batch Compressor</Typography>
              </Link>
            </Stack>
          </Grid>

          {/* Company */}
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
              Resources
            </Typography>
            <Stack spacing={1.5}>
              <Link href="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>About Us</Typography>
              </Link>
              <Link href="/features" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Features Catalog</Typography>
              </Link>
              <Link href="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Latest Blog</Typography>
              </Link>
              <Link href="/contact" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Contact Support</Typography>
              </Link>
            </Stack>
          </Grid>

          {/* Compliance */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
              Legal & Compliance
            </Typography>
            <Stack spacing={1.5}>
              <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Privacy Policy</Typography>
              </Link>
              <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Terms of Service</Typography>
              </Link>
              <Link href="/cookies" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>Cookie Policy</Typography>
              </Link>
              <Link href="/gdpr" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>GDPR Compliance</Typography>
              </Link>
              <Link href="/ccpa" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>CCPA Compliance</Typography>
              </Link>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              &copy; {new Date().getFullYear()} Squoosh Next. Developed & Maintained by <strong>Naushad Alam</strong> | <strong>Zest Tech Solution</strong> | Powered by <strong>Vercel</strong>.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Contact: <strong>Naushad Alam</strong> | WhatsApp: <strong>7492068998</strong> | Email: <a href="mailto:contact@zestcommerce.in" style={{ color: 'inherit', textDecoration: 'underline' }}>contact@zestcommerce.in</a> | Web: <a href="https://zesttechsolution.cloud" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>zesttechsolution.cloud</a>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="caption" color="text.secondary">Security Encrypted</Typography>
            <Typography variant="caption" color="text.secondary">No Uploads</Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
