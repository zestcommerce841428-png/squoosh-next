import Link from 'next/link';
import { Container, Box, Typography, Button, Stack, Card, Chip } from '@mui/material';
import { getLiveToolsCount } from '../features/features-data';

const LIVE = getLiveToolsCount();

export const metadata = {
  title: 'Welcome to Squoosh Next',
  description: `Get started with Squoosh Next — ${LIVE}+ professional, privacy-first image tools that run entirely in your browser.`,
};

const STEPS = [
  { icon: '🖼️', title: 'Pick a tool', desc: `Browse ${LIVE}+ tools — compress, convert, resize, enhance, encrypt and more.` },
  { icon: '🔐', title: 'Sign in once', desc: 'Create a free account to unlock every tool and save your profile.' },
  { icon: '⚡', title: 'Process locally', desc: 'Everything runs in your browser. Your images never leave your device.' },
  { icon: '⬇️', title: 'Download', desc: 'Export the result instantly — no watermarks, no waiting, no uploads.' },
];

const HIGHLIGHTS = [
  { icon: '🗜️', title: 'Compression & Convert', desc: 'MozJPEG, WebP, AVIF, PNG, HEIC, TIFF — shrink and convert with full quality control.' },
  { icon: '✨', title: 'Enhance & Edit', desc: 'Sharpen, denoise, upscale, color-correct, watermark, crop, borders and filters.' },
  { icon: '🛍️', title: 'Creative & Commerce', desc: 'Logos, posters, memes, QR codes, product shadows, social-media presets and kits.' },
  { icon: '🔒', title: 'Privacy & Security', desc: 'AES-256 image encryption, EXIF/GPS stripping and self-destructing share links.' },
];

export default function WelcomePage() {
  return (
    <Box>
      {/* Hero */}
      <Box
        sx={{
          textAlign: 'center', py: { xs: 6, md: 10 }, px: 2,
          background: 'radial-gradient(1200px 500px at 50% -10%, rgba(99,102,241,0.16), transparent 60%)',
        }}
      >
        <Container maxWidth="md">
          <Chip label="🎉 Welcome aboard" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 700 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900, fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' }, lineHeight: 1.1, mb: 2,
              background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            Your complete image toolkit, in the browser
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 680, mx: 'auto', mb: 4, fontWeight: 400 }}>
            {LIVE}+ professional tools to compress, convert, edit, enhance and protect images —
            100% client-side, private, and free.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Link href="/auth/signup">
              <Button variant="contained" size="large" sx={{ fontWeight: 700, px: 4, py: 1.25 }}>
                Create free account
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outlined" size="large" sx={{ fontWeight: 700, px: 4, py: 1.25 }}>
                Browse {LIVE}+ tools
              </Button>
            </Link>
          </Stack>
        </Container>
      </Box>

      {/* How it works */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Typography variant="h4" textAlign="center" sx={{ fontWeight: 800, mb: 1 }}>How it works</Typography>
        <Typography textAlign="center" color="text.secondary" sx={{ mb: 5 }}>Four simple steps — no installs, no uploads.</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          {STEPS.map((s, i) => (
            <Card key={s.title} sx={{ p: 3, height: '100%', position: 'relative', border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ position: 'absolute', top: 12, right: 16, fontWeight: 800, color: 'text.disabled' }}>{i + 1}</Box>
              <Box sx={{ fontSize: 36, mb: 1 }}>{s.icon}</Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{s.title}</Typography>
              <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Highlights */}
      <Box sx={{ bgcolor: 'action.hover', py: { xs: 5, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="h4" textAlign="center" sx={{ fontWeight: 800, mb: 5 }}>What you can do</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {HIGHLIGHTS.map((h) => (
              <Card key={h.title} sx={{ p: 3, display: 'flex', gap: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ fontSize: 32 }}>{h.icon}</Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{h.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{h.desc}</Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA band */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Ready to start?</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>Sign in once and every tool is yours.</Typography>
        <Link href="/auth/signup">
          <Button variant="contained" size="large" sx={{ fontWeight: 700, px: 5, py: 1.25 }}>
            Get started — it&apos;s free
          </Button>
        </Link>
      </Container>
    </Box>
  );
}
