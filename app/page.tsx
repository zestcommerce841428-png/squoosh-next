import Link from 'next/link';
import { Container, Typography, Box, Button, Grid, Card, Stack, Chip, Paper, Divider } from '@mui/material';

export const metadata = {
  title: 'Squoosh Next — Professional Browser-Native Image Optimizer',
  description: 'Compress, convert, and edit 100+ image formats entirely in your browser. MozJPEG, WebP, AVIF, OxiPNG, and 230 advanced tools — zero server uploads.',
};

const STATS = [
  { value: '230+', label: 'Catalogued Features' },
  { value: '100+', label: 'Supported Formats' },
  { value: '0 B', label: 'Data Uploaded to Servers' },
  { value: '100%', label: 'Client-Side Processing' },
];

const FEATURES = [
  {
    title: 'MozJPEG / OxiPNG / AVIF / WebP Codecs',
    desc: 'Use the same native C/C++ codecs compiled to WebAssembly that power the original Google Squoosh — trellis quantization, progressive rendering, lossless modes, and custom subsampling.',
    badge: 'Compression',
    color: '#3b82f6',
  },
  {
    title: '100% Client-Side Privacy',
    desc: 'Images never leave your device. There is no upload endpoint, no cloud queue, and no third-party image API. Compression runs in isolated WebAssembly sandboxes inside your browser tab.',
    badge: 'Privacy',
    color: '#10b981',
  },
  {
    title: 'Real-Time Split-Preview Comparison',
    desc: 'Drag the split slider between the original and compressed output to compare quality at any pixel. Side-by-side mode, zoom, and pan also supported.',
    badge: 'Preview',
    color: '#8b5cf6',
  },
  {
    title: 'Batch Mode — Process Hundreds of Images',
    desc: 'Drop a folder of assets. Batch mode auto-compresses each file using your selected codec and settings, then packages everything into a single ZIP for download.',
    badge: 'Batch',
    color: '#f59e0b',
  },
  {
    title: '230 Advanced Tool Archetypes',
    desc: 'Beyond compression: resize with aspect lock, crop to ratio presets, rotate and flip, watermark, add borders, pixelate, dither (Floyd-Steinberg / Bayer), channel isolation, ASCII art, cinematic color grading, histogram analysis, EXIF metadata inspector, favicon generator, and more.',
    badge: 'Tools',
    color: '#ef4444',
  },
  {
    title: 'Live RGB Histogram + Dominant Palette',
    desc: 'Analyze luminance distribution across red, green, and blue channels in real time. Extract the top 8 dominant colors with HEX, RGB, and WCAG contrast ratio values.',
    badge: 'Analytics',
    color: '#06b6d4',
  },
];

const FORMATS = [
  ['Web', 'JPEG · PNG · WebP · AVIF · GIF · SVG · ICO'],
  ['Camera RAW', 'CR2 · NEF · ARW · DNG · RAF · ORF'],
  ['Design', 'PSD · AI · EPS · PDF · TIFF · HEIC'],
  ['Scientific', 'FITS · DICOM · HDF5 · NetCDF'],
  ['Exotic', 'BMP · TGA · PCX · PPM · XBM · FLIF'],
  ['Output-Only', 'ASCII Art · CSS Data URI · HTML Embed · ZIP Bundle'],
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Drop Your Image', desc: 'Drag any image file onto the workspace. Supports JPEG, PNG, WebP, AVIF, GIF, SVG, PSD, HEIC, RAW formats, and more.' },
  { step: '02', title: 'Choose a Codec & Settings', desc: 'Select MozJPEG, WebP, OxiPNG, or AVIF. Tune quality, quantization, subsampling, progressive mode, and resize dimensions.' },
  { step: '03', title: 'Compare in Real Time', desc: 'Drag the split slider to compare original and output side-by-side. The size reduction and quality delta update instantly.' },
  { step: '04', title: 'Download or Batch Export', desc: 'Save the optimized file instantly. Or use Batch Mode to process a folder and download all results as a ZIP archive.' },
];

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Squoosh Next',
    url: 'https://squoosh-next.vercel.app',
    description: 'Professional client-side image compression and format optimization tool supporting 100+ formats.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://squoosh-next.vercel.app/features?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: 'background.paper', pt: { xs: 8, md: 14 }, pb: { xs: 8, md: 12 }, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3.5}>
                <Chip label="Open Source · Apache 2.0 · Zero Server Uploads" color="primary" variant="outlined" sx={{ width: 'fit-content', fontWeight: 700 }} />
                <Typography variant="h1" component="h1" sx={{ fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px', fontSize: { xs: '2.6rem', md: '3.8rem' } }}>
                  Professional{' '}
                  <Box component="span" sx={{ background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Image Optimizer
                  </Box>{' '}
                  — Entirely in Your Browser
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, lineHeight: 1.65, fontSize: '1.1rem' }}>
                  Compress, convert, resize, and edit with MozJPEG, WebP, AVIF, and OxiPNG codecs. 230 tools. 100+ formats. Zero server uploads — your images never leave your device.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button component={Link} href="/compress" variant="contained" color="primary" size="large" sx={{ px: 4, py: 1.5, fontWeight: 700, fontSize: '1rem' }}>
                    Open Workspace
                  </Button>
                  <Button component={Link} href="/features" variant="outlined" color="primary" size="large" sx={{ px: 4, py: 1.5, fontWeight: 700, fontSize: '1rem' }}>
                    Browse 230 Tools
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {['MozJPEG', 'WebP', 'AVIF', 'OxiPNG', 'Batch Mode', 'Histogram'].map(t => (
                    <Chip key={t} label={t} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                  ))}
                </Stack>
              </Stack>
            </Grid>

            {/* Stats Panel */}
            <Grid item xs={12} md={6}>
              <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, borderColor: 'primary.main', background: 'linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(99,102,241,0.04) 100%)' }}>
                <Grid container spacing={2}>
                  {STATS.map(s => (
                    <Grid item xs={6} key={s.label}>
                      <Card variant="outlined" sx={{ p: 2.5, textAlign: 'center', borderRadius: 2.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-1px' }}>{s.value}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{s.label}</Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ mt: 3, p: 2.5, bgcolor: 'success.main', color: 'white', borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Privacy Guaranteed by Architecture</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>No upload endpoint exists. Images are processed in WebAssembly sandboxes running locally.</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>How It Works</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
              Four steps from raw file to production-ready optimized asset.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {HOW_IT_WORKS.map((step, i) => (
              <Grid item xs={12} sm={6} md={3} key={step.step}>
                <Stack spacing={2} alignItems="flex-start">
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.85rem' }}>{step.step}</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{step.desc}</Typography>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'relative' }} />
                  )}
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Divider />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>Everything You Need to Optimize Images</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              From single-file compression to enterprise batch pipelines — one tool does it all, without leaving your browser.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {FEATURES.map(f => (
              <Grid item xs={12} sm={6} md={4} key={f.title}>
                <Card sx={{ p: 3.5, height: '100%', borderTop: '3px solid', borderColor: f.color, '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.2s' }}>
                  <Chip label={f.badge} size="small" sx={{ mb: 2, fontWeight: 700, bgcolor: f.color + '18', color: f.color, border: `1px solid ${f.color}40` }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.3 }}>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>{f.desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button component={Link} href="/features" variant="outlined" size="large" sx={{ fontWeight: 700, px: 5 }}>
              View All 230 Features →
            </Button>
          </Box>
        </Container>
      </Box>

      <Divider />

      {/* ── Format Support ───────────────────────────────────────────────── */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>100+ Format Support</Typography>
            <Typography variant="body1" color="text.secondary">From everyday web formats to exotic scientific and camera RAW files.</Typography>
          </Box>
          <Grid container spacing={3}>
            {FORMATS.map(([cat, fmts]) => (
              <Grid item xs={12} sm={6} md={4} key={cat}>
                <Card variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>{cat}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9, fontFamily: 'monospace', fontSize: '0.8rem' }}>{fmts}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <Box sx={{ py: 12, textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(99,102,241,0.06) 100%)', borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="sm">
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.5px' }}>
            Ready to Compress?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
            No sign-up. No upload. No limit. Just drop your image and get a smaller, sharper file — instantly.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button component={Link} href="/compress" variant="contained" size="large" sx={{ fontWeight: 700, px: 5, py: 1.5 }}>
              Start Compressing Free
            </Button>
            <Button component={Link} href="/blog" variant="outlined" size="large" sx={{ fontWeight: 700, px: 5, py: 1.5 }}>
              Read the Blog
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
