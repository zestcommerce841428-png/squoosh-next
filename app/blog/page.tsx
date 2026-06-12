'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container, Typography, Box, Grid, Card, CardContent, Chip, Button, TextField, MenuItem, Select, FormControl, InputLabel, Stack, Pagination } from '@mui/material';
import { BLOG_POSTS } from '../../constants/blogData';

export default function BlogListingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);

  const categories = ['All', 'Codecs', 'Color Theory', 'WebAssembly', 'Optimization', 'Security', 'Performance', 'Image Processing', 'Vector', 'Web Design'];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const postsPerPage = 9;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;
  const paginatedPosts = filteredPosts.slice((page - 1) * postsPerPage, page * postsPerPage);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setPage(1);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
          Image Optimization Blog
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Deep-dives into compression algorithms, browser APIs, and web performance engineering.
        </Typography>
      </Box>

      {/* Filter and Search Bar */}
      <Card sx={{ p: 3, mb: 5 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              size="small"
              label="Search articles..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => handleCategoryChange(e.target.value as string)}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Blog Cards */}
      <Grid container spacing={4}>
        {paginatedPosts.map((post) => (
          <Grid item xs={12} md={4} key={post.slug}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Chip label={post.category} size="small" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1.25rem', lineHeight: 1.3 }}>
                  {post.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {post.summary}
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {post.date}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {post.readTime}
                  </Typography>
                </Stack>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  component={Link}
                  href={`/blog/${post.slug}`}
                  size="small" 
                  variant="outlined" 
                  fullWidth 
                  sx={{ fontWeight: 700 }}
                >
                  Read Article
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {filteredPosts.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(_, val) => {
              setPage(val);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            color="primary" 
            size="large"
          />
        </Box>
      )}

      {filteredPosts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">No articles found matching your criteria.</Typography>
        </Box>
      )}
    </Container>
  );
}
