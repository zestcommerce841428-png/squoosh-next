'use client';

import { Container, Typography, Box, Grid, Card, CardContent, CardActionArea, Chip, Stack } from '@mui/material';
import Link from 'next/link';

const tools = [
  {
    id: 'background-remover',
    name: 'AI Background Remover',
    description: 'Remove image backgrounds instantly with AI',
    category: 'AI Tools',
    icon: '🎨',
    color: '#3b82f6',
  },
  {
    id: 'compress',
    name: 'Image Compression',
    description: 'Compress images without losing quality',
    category: 'Optimization',
    icon: '📦',
    color: '#10b981',
  },
  {
    id: 'format-converter',
    name: 'Format Converter',
    description: 'Convert between 100+ image formats',
    category: 'Conversion',
    icon: '🔄',
    color: '#8b5cf6',
  },
  {
    id: 'resizer',
    name: 'Image Resizer',
    description: 'Resize images to any dimension',
    category: 'Editing',
    icon: '📏',
    color: '#f59e0b',
  },
  {
    id: 'smart-crop',
    name: 'Smart Crop',
    description: 'AI-powered intelligent cropping',
    category: 'AI Tools',
    icon: '✂️',
    color: '#ef4444',
  },
  {
    id: 'rotate-flip',
    name: 'Rotate & Flip',
    description: 'Rotate and flip images easily',
    category: 'Editing',
    icon: '🔄',
    color: '#06b6d4',
  },
  {
    id: 'filters',
    name: 'Image Filters',
    description: 'Apply blur, sharpen, and artistic filters',
    category: 'Effects',
    icon: '✨',
    color: '#ec4899',
  },
  {
    id: 'color-adjust',
    name: 'Color Adjustments',
    description: 'Adjust brightness, contrast, saturation',
    category: 'Editing',
    icon: '🎨',
    color: '#f97316',
  },
  {
    id: 'watermark',
    name: 'Watermark Tool',
    description: 'Add text or image watermarks',
    category: 'Branding',
    icon: '©️',
    color: '#84cc16',
  },
  {
    id: 'splitter',
    name: 'Image Splitter',
    description: 'Split images into tiles or grids',
    category: 'Editing',
    icon: '🔲',
    color: '#14b8a6',
  },
  {
    id: 'merger',
    name: 'Image Merger',
    description: 'Combine multiple images',
    category: 'Editing',
    icon: '🔗',
    color: '#3b82f6',
  },
  {
    id: 'collage',
    name: 'Collage Maker',
    description: 'Create photo collages',
    category: 'Creation',
    icon: '🖼️',
    color: '#a855f7',
  },
  {
    id: 'border',
    name: 'Border & Frame',
    description: 'Add borders and frames',
    category: 'Effects',
    icon: '🖼️',
    color: '#6366f1',
  },
  {
    id: 'text',
    name: 'Text on Image',
    description: 'Add text overlays to images',
    category: 'Editing',
    icon: '📝',
    color: '#10b981',
  },
  {
    id: 'gif-creator',
    name: 'GIF Creator',
    description: 'Create animated GIFs from images',
    category: 'Animation',
    icon: '🎬',
    color: '#f59e0b',
  },
  {
    id: 'favicon',
    name: 'Favicon Generator',
    description: 'Generate favicons in all sizes',
    category: 'Web',
    icon: '🌐',
    color: '#ef4444',
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Create custom QR codes',
    category: 'Utility',
    icon: '📱',
    color: '#8b5cf6',
  },
  {
    id: 'palette',
    name: 'Color Palette Extractor',
    description: 'Extract color palettes from images',
    category: 'Analysis',
    icon: '🎨',
    color: '#ec4899',
  },
  {
    id: 'metadata',
    name: 'Metadata Viewer',
    description: 'View and edit image metadata',
    category: 'Information',
    icon: '📊',
    color: '#06b6d4',
  },
  {
    id: 'compare',
    name: 'Image Comparison',
    description: 'Compare two images side-by-side',
    category: 'Analysis',
    icon: '⚖️',
    color: '#f97316',
  },
  {
    id: 'batch-resize',
    name: 'Batch Resizer',
    description: 'Resize multiple images at once',
    category: 'Batch',
    icon: '📚',
    color: '#84cc16',
  },
  {
    id: 'thumbnail',
    name: 'Thumbnail Creator',
    description: 'Create eye-catching thumbnails',
    category: 'Creation',
    icon: '🖼️',
    color: '#14b8a6',
  },
  {
    id: 'instagram-post',
    name: 'Instagram Post Creator',
    description: 'Create Instagram-ready posts',
    category: 'Social Media',
    icon: '📸',
    color: '#e91e63',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story Creator',
    description: 'Design Instagram stories',
    category: 'Social Media',
    icon: '📱',
    color: '#9c27b0',
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    description: 'Create YouTube thumbnails',
    category: 'Social Media',
    icon: '🎥',
    color: '#f44336',
  },
  {
    id: 'logo-creator',
    name: 'Logo Creator',
    description: 'Design professional logos',
    category: 'Creation',
    icon: '🎯',
    color: '#3f51b5',
  },
  {
    id: 'poster',
    name: 'Poster Creator',
    description: 'Create marketing posters',
    category: 'Marketing',
    icon: '📰',
    color: '#ff9800',
  },
  {
    id: 'meme',
    name: 'Meme Generator',
    description: 'Create memes with templates',
    category: 'Fun',
    icon: '😂',
    color: '#4caf50',
  },
  {
    id: 'quote',
    name: 'Quote Image Generator',
    description: 'Create beautiful quote images',
    category: 'Social Media',
    icon: '💬',
    color: '#00bcd4',
  },
  {
    id: 'mockup',
    name: 'Product Mockup',
    description: 'Create product mockups',
    category: 'E-commerce',
    icon: '🛍️',
    color: '#009688',
  },
  {
    id: 'social-kit',
    name: 'Social Media Kit',
    description: 'Complete social media asset generator',
    category: 'Social Media',
    icon: '📱',
    color: '#673ab7',
  },
];

const categories = ['All', 'AI Tools', 'Editing', 'Effects', 'Social Media', 'Creation', 'Optimization', 'Utility'];

export default function ToolsPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          31 Professional Image Tools
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', mb: 2 }}>
          Complete suite of image editing, optimization, and creation tools. All free, browser-based, and privacy-focused.
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
          {categories.map((cat) => (
            <Chip key={cat} label={cat} size="small" clickable />
          ))}
        </Stack>
      </Box>

      {/* Tools Grid */}
      <Grid container spacing={3}>
        {tools.map((tool) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={tool.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                component={Link}
                href={`/tools/${tool.id}`}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
              >
                <Box
                  sx={{
                    p: 3,
                    bgcolor: tool.color,
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '3rem',
                  }}
                >
                  {tool.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {tool.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {tool.description}
                  </Typography>
                  <Chip label={tool.category} size="small" sx={{ bgcolor: tool.color, color: 'white' }} />
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stats */}
      <Box sx={{ mt: 6, textAlign: 'center', p: 4, bgcolor: 'action.hover', borderRadius: 2 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
              31
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Professional Tools
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.main' }}>
              100%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Free to Use
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main' }}>
              0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign-up Required
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'info.main' }}>
              ∞
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unlimited Use
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
