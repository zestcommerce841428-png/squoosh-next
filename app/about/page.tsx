import { Container, Typography, Box, Stack, Grid, Card, Chip, Divider, Avatar } from '@mui/material';
import { SITE_DOMAIN } from '../../lib/siteConfig';

export const metadata = {
  title: 'About Us - Squoosh Next | Zest Tech Solution',
  description: 'Meet the team behind Squoosh Next — a premium, 100% client-side image compression and conversion suite built by Naushad Alam at Zest Tech Solution.',
};

const TEAM = [
  {
    name: 'Naushad Alam',
    role: 'Lead Developer & Founder',
    bio: 'Full-stack engineer specializing in WebAssembly, Next.js, and browser-native performance applications. Founded Zest Tech Solution to deliver professional-grade web tools.',
    initials: 'NA',
    color: '#3b82f6',
  },
];

const TECH_STACK = [
  { name: 'Next.js 16', desc: 'React Server Components and App Router for blazing-fast static generation', badge: 'Framework' },
  { name: 'Material UI v6', desc: 'Enterprise-grade design system with 60+ custom color themes and dark mode', badge: 'UI Layer' },
  { name: 'WebAssembly', desc: 'Native C/C++ codecs compiled to WASM for near-native compression speed', badge: 'Core Engine' },
  { name: 'HTML5 Canvas API', desc: 'Pixel-level image manipulation, filters, effects, and format conversion', badge: 'Rendering' },
  { name: 'Web Workers', desc: 'Background thread processing to keep the UI responsive during heavy operations', badge: 'Concurrency' },
  { name: 'Vercel Edge Network', desc: 'Global CDN deployment with automatic SSL and serverless function support', badge: 'Hosting' },
];

const MILESTONES = [
  { year: '2023', event: 'Project conception — rebuilding Squoosh with modern Next.js App Router architecture' },
  { year: '2024', event: 'Core compression engine finalized with MozJPEG, WebP, OxiPNG, and AVIF WASM codecs' },
  { year: '2025', event: 'Launch of 230-feature catalog with accessibility suite and 60+ color themes' },
  { year: '2026', event: 'Full production release on Vercel with GDPR/CCPA compliance and Google Analytics integration' },
];

export default function AboutPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero */}
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Chip label="Open Source Heritage · Professional Grade" color="primary" variant="outlined" sx={{ mb: 3, fontWeight: 700 }} />
        <Typography variant="h2" component="h1" sx={{ fontWeight: 900, mb: 2.5, letterSpacing: '-1px', lineHeight: 1.1 }}>
          About Squoosh Next
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', lineHeight: 1.7, fontWeight: 400 }}>
          A professional, privacy-first image optimization suite rebuilt from the ground up using Next.js 16, Material UI, and WebAssembly codecs — running entirely inside your browser.
        </Typography>
      </Box>

      {/* Mission + Heritage Cards */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, height: '100%', borderLeft: '4px solid', borderColor: 'primary.main' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Our Mission</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              To democratize professional-grade image optimization by delivering high-performance, browser-native tools that require zero server infrastructure. Every image you process stays on your device — we believe privacy is not a feature, it is a fundamental right.
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, height: '100%', borderLeft: '4px solid', borderColor: 'secondary.main' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Open Source Heritage</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Squoosh Next builds upon the pioneering work of the Google Chrome Labs team, who engineered the original Squoosh project and the WebAssembly codec wrappers for MozJPEG, libwebp, libaom, and OxiPNG. We extend this foundation with a professional Next.js application layer, advanced tooling, and an enterprise-grade UI.
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, height: '100%', borderLeft: '4px solid', borderColor: 'success.main' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Privacy by Design</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              Every architectural decision is made with privacy as the primary constraint. Image data never traverses a network. There are no upload endpoints, no cloud queues, and no third-party image processing APIs. Compression happens in isolated WebAssembly sandboxes running inside your browser tab.
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 4, height: '100%', borderLeft: '4px solid', borderColor: 'warning.main' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Enterprise Feature Depth</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              With 230+ catalogued features spanning compression, format conversion, AI-assisted editing, batch processing, SEO metadata management, ecommerce optimization, and accessibility tooling, Squoosh Next serves individual developers, design studios, and enterprise content teams alike.
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Technology Stack */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Technology Stack</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Built on modern, battle-tested web platform primitives with zero runtime server dependencies.
        </Typography>
        <Grid container spacing={3}>
          {TECH_STACK.map((tech) => (
            <Grid item xs={12} sm={6} md={4} key={tech.name}>
              <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{tech.name}</Typography>
                  <Chip label={tech.badge} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {tech.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Timeline */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Project Timeline</Typography>
        <Stack spacing={0}>
          {MILESTONES.map((m, i) => (
            <Box key={m.year} sx={{ display: 'flex', gap: 3, pb: i < MILESTONES.length - 1 ? 4 : 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, fontSize: '0.7rem' }}>{m.year}</Typography>
                </Box>
                {i < MILESTONES.length - 1 && (
                  <Box sx={{ width: 2, flexGrow: 1, bgcolor: 'divider', mt: 1 }} />
                )}
              </Box>
              <Box sx={{ pt: 1.5, pb: 1 }}>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>{m.event}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Team */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Meet the Team</Typography>
        <Grid container spacing={4}>
          {TEAM.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member.name}>
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Avatar sx={{ width: 72, height: 72, bgcolor: member.color, fontSize: '1.5rem', fontWeight: 800, mx: 'auto', mb: 2 }}>
                  {member.initials}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>{member.name}</Typography>
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, display: 'block', mb: 1.5 }}>{member.role}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{member.bio}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Contact CTA */}
      <Card sx={{ p: 5, textAlign: 'center', background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(99,102,241,0.06) 100%)', border: '1px solid', borderColor: 'primary.main' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>Get in Touch</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Enterprise licensing, custom integrations, or technical inquiries — we respond within 24 hours.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" flexWrap="wrap">
          <Typography variant="body2"><strong>Developer:</strong> Naushad Alam</Typography>
          <Typography variant="body2"><strong>WhatsApp:</strong> +91 7492068998</Typography>
          <Typography variant="body2"><strong>Email:</strong> contact@zestcommerce.in</Typography>
          <Typography variant="body2"><strong>Web:</strong> {SITE_DOMAIN}</Typography>
        </Stack>
      </Card>
    </Container>
  );
}
