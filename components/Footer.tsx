'use client';

import Link from 'next/link';
import { Container, Grid, Typography, Stack, Box, Divider } from '@mui/material';
import BuildStatus from './BuildStatus';
import { SITE_URL, SITE_DOMAIN } from '../lib/siteConfig';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Box component={Link} href={href} sx={{ textDecoration: 'none', color: 'inherit' }}>
    <Typography variant="body2" color="text.secondary" sx={{ '&:hover': { color: 'primary.main' } }}>
      {children}
    </Typography>
  </Box>
);

export default function Footer() {
  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', py: 6, mt: 'auto' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand */}
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <Box component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                  Squoosh Next
                </Typography>
              </Box>
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
              <NavLink href="/compress-jpeg">JPEG Compressor</NavLink>
              <NavLink href="/compress-png">PNG Compressor</NavLink>
              <NavLink href="/compress-webp">WebP Compressor</NavLink>
              <NavLink href="/compress-avif">AVIF Compressor</NavLink>
              <NavLink href="/compress-pdf">PDF Compressor</NavLink>
              <NavLink href="/batch-compress">Batch Compressor</NavLink>
            </Stack>
          </Grid>

          {/* Resources */}
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
              Resources
            </Typography>
            <Stack spacing={1.5}>
              <NavLink href="/about">About Us</NavLink>
              <NavLink href="/features">Features Catalog</NavLink>
              <NavLink href="/blog">Latest Blog</NavLink>
              <NavLink href="/contact">Contact Support</NavLink>
            </Stack>
          </Grid>

          {/* Compliance */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase' }}>
              Legal & Compliance
            </Typography>
            <Stack spacing={1.5}>
              <NavLink href="/privacy">Privacy Policy</NavLink>
              <NavLink href="/terms">Terms of Service</NavLink>
              <NavLink href="/cookies">Cookie Policy</NavLink>
              <NavLink href="/gdpr">GDPR Compliance</NavLink>
              <NavLink href="/ccpa">CCPA Compliance</NavLink>
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
              Contact: <strong>Naushad Alam</strong> | WhatsApp: <strong>7492068998</strong> |{' '}
              Email:{' '}
              <Box component="a" href="mailto:contact@zestcommerce.in" sx={{ color: 'inherit', textDecoration: 'underline' }}>
                contact@zestcommerce.in
              </Box>{' '}
              | Web:{' '}
              <Box component="a" href={SITE_URL} target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit', textDecoration: 'underline' }}>
                {SITE_DOMAIN}
              </Box>
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Typography variant="caption" color="text.secondary">Security Encrypted</Typography>
            <Typography variant="caption" color="text.secondary">No Uploads</Typography>
          </Stack>
        </Box>
      </Container>
      
      {/* Real-time Build Status */}
      <BuildStatus />
    </Box>
  );
}
