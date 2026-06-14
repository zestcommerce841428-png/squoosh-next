'use client';

import { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  Tabs,
  Tab,
  TextField,
  Chip,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { FEATURES_DATA, CATEGORIES, getLiveToolsCount, getComingSoonCount } from './features-data';

// Icon definitions
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const getSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default function FeaturesPage() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle Tab Change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter Features based on tab and search query
  const filteredFeatures = useMemo(() => {
    return FEATURES_DATA.filter((feature) => {
      const selectedCategory = CATEGORIES[tabValue];
      const matchesCategory =
        selectedCategory === 'All Features' || feature.category === selectedCategory;
      const matchesSearch =
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [tabValue, searchQuery]);

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      {/* Title Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Professional Image Tools Suite
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
          46 fully functional tools are live now with 184+ advanced features coming soon. All tools run 100% in your browser for complete privacy and security.
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">
          <Chip label="✅ 46 Tools Live Now" color="success" sx={{ fontWeight: 700 }} />
          <Chip label="🚀 184+ Coming Soon" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
          <Chip label="🔒 100% Client-Side & Secure" variant="outlined" color="success" sx={{ fontWeight: 600 }} />
          <Chip label="💯 No Demo - All Functional" variant="outlined" color="info" sx={{ fontWeight: 600 }} />
        </Stack>
      </Box>

      {/* Search Bar */}
      <Box sx={{ maxWidth: 600, mx: 'auto', mb: 5 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search features (e.g. AI background, AVIF, metadata, batch rename)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1.5, color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                <SearchIcon />
              </Box>
            ),
          }}
        />
      </Box>

      {/* Categories Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.9rem',
              px: 3,
            },
          }}
        >
          {CATEGORIES.map((cat, idx) => (
            <Tab key={idx} label={cat} />
          ))}
        </Tabs>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={3}>
        {filteredFeatures.map((feature) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={feature.id}>
            <Card
              variant="outlined"
              sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                  borderColor: 'primary.main',
                },
              }}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {feature.category}
                  </Typography>
                  <Chip label={feature.badge} size="small" variant="outlined" color="primary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon /> {feature.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Box>
              <Box sx={{ pt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                {feature.status === 'live' && feature.slug ? (
                  <Button component={Link} href={`/tools/${feature.slug}`} variant="contained" size="small" sx={{ fontWeight: 700 }}>
                    Use Tool Now &rarr;
                  </Button>
                ) : (
                  <Button variant="outlined" size="small" disabled sx={{ fontWeight: 700 }}>
                    Coming Soon
                  </Button>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
        {filteredFeatures.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No matching features found. Try another query or category.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* CTA Section */}
      <Box sx={{ mt: 8, p: 5, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          Ready to Optimize Your Assets?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          Start using Squoosh Next directly inside your browser. All compression, editing, and conversion features operate locally without uploading files to servers.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button component={Link} href="/compress" variant="contained" size="large" sx={{ fontWeight: 700, px: 4, py: 1.5 }}>
            Open Workspace
          </Button>
          <Button component={Link} href="/contact" variant="outlined" size="large" sx={{ fontWeight: 700, px: 4, py: 1.5 }}>
            Contact Support
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
