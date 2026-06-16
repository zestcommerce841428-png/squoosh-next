import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container, Typography, Box, Button, Chip, Stack, Card, Divider, Paper } from '@mui/material';
import { BLOG_POSTS } from '../../../constants/blogData';
import { SITE_URL } from '../../../lib/siteConfig';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
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
    twitter: { card: 'summary_large_image', title: post.title, description: post.summary },
  };
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getAuthorColor(name: string) {
  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[h % colors.length];
}

function renderContent(content: string) {
  const sentences = content.split(/(?<=[.!?])\s+/);
  const chunks: string[][] = [];
  let cur: string[] = [];
  sentences.forEach((s, i) => {
    cur.push(s);
    if (cur.length >= 3 || i === sentences.length - 1) {
      chunks.push([...cur]);
      cur = [];
    }
  });

  return chunks.map((chunk, i) => (
    <Typography key={i} variant="body1" sx={{ lineHeight: 1.9, fontSize: '1.05rem', mb: 3, color: 'text.primary' }}>
      {chunk.join(' ')}
    </Typography>
  ));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) notFound();

  const allInCategory = BLOG_POSTS.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: new Date(post.date).toISOString(),
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Squoosh Next', logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };

  const color = getAuthorColor(post.author);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/blog">
        <Button sx={{ mb: 4, fontWeight: 700 }}>← Back to Blog</Button>
      </Link>

      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
          <Chip label={post.category} color="primary" size="small" sx={{ fontWeight: 700 }} />
          <Typography variant="caption" color="text.secondary">{post.date}</Typography>
          <Typography variant="caption" color="text.secondary">·</Typography>
          <Typography variant="caption" color="text.secondary">{post.readTime}</Typography>
        </Stack>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 900, lineHeight: 1.2, mb: 2.5, letterSpacing: '-0.5px' }}>
          {post.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3, fontSize: '1.1rem' }}>
          {post.summary}
        </Typography>

        {/* Author row */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.75rem' }}>{getInitials(post.author)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{post.author}</Typography>
            <Typography variant="caption" color="text.secondary">Contributing Author · Squoosh Next Blog</Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 5 }} />

      {/* Article Body */}
      <Box sx={{ mb: 6 }}>
        {renderContent(post.content)}
      </Box>

      {/* Key Takeaways */}
      <Paper variant="outlined" sx={{ p: 3.5, mb: 6, borderColor: 'primary.main', borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>Key Takeaways</Typography>
        <Stack component="ul" spacing={0.8} sx={{ pl: 2.5, m: 0 }}>
          {post.content.split(/[.!?]/).filter(s => s.trim().length > 30).slice(0, 4).map((s, i) => (
            <Box component="li" key={i}>
              <Typography variant="body2" sx={{ lineHeight: 1.7, opacity: 0.95 }}>{s.trim()}.</Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* Try It CTA */}
      <Card variant="outlined" sx={{ p: 3.5, mb: 6, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Try It in the Workspace</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
          Everything discussed in this article can be tested directly in Squoosh Next — no sign-up, no upload, 100% client-side.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Link href="/compress"><Button variant="contained" sx={{ fontWeight: 700 }}>Open Compressor</Button></Link>
          <Link href="/features"><Button variant="outlined" sx={{ fontWeight: 700 }}>Browse 230 Tools</Button></Link>
        </Stack>
      </Card>

      {/* Related Posts */}
      {allInCategory.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>More in {post.category}</Typography>
          <Stack spacing={2}>
            {allInCategory.map(rel => (
              <Card key={rel.slug} variant="outlined" sx={{ p: 2.5, '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 0.2s' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{rel.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{rel.date} · {rel.readTime}</Typography>
                  </Box>
                  <Link href={`/blog/${rel.slug}`}>
                    <Button size="small" variant="text" sx={{ fontWeight: 700, flexShrink: 0 }}>Read →</Button>
                  </Link>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Container>
  );
}
