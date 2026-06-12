import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Typography, Box, Button, Chip, Stack, Card, Divider } from '@mui/material';
import { BLOG_POSTS } from '../../../constants/blogData';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: `${post.title} - Squoosh Next Blog`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      tags: [post.category],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) {
    notFound();
  }

  // Schema.org BlogPosting metadata
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.summary,
    'datePublished': new Date(post.date).toISOString(),
    'author': {
      '@type': 'Person',
      'name': post.author,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Squoosh Next',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://squoosh-next.vercel.app/logo.png',
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://squoosh-next.vercel.app/blog/${post.slug}`,
    },
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {/* Schema.org Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Box sx={{ mb: 4 }}>
        <Link href="/blog" passHref style={{ textDecoration: 'none' }}>
          <Button sx={{ mb: 3, fontWeight: 700 }}>
            &larr; Back to Blog
          </Button>
        </Link>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={post.category} color="primary" size="small" sx={{ fontWeight: 600 }} />
          <Typography variant="caption" color="text.secondary">
            {post.date} &bull; {post.readTime}
          </Typography>
        </Stack>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 2 }}>
          {post.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic', mb: 3 }}>
          Written by {post.author}
        </Typography>
        <Divider />
      </Box>

      <Card sx={{ p: 4 }}>
        <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem', mb: 3 }}>
          {post.content}
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
          Whether you are a developer looking to reduce bundles, a designer polishing assets, or a photographer archiving work, setting the exact quantization steps, choosing progressive rendering, and selecting high-performance presets can yield massive speed boosts. Play with the Squoosh Next workspace to see real-time comparisons on your files!
        </Typography>
      </Card>
    </Container>
  );
}
