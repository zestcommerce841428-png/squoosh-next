import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '../constants/blogData';
import { SITE_URL } from '../lib/siteConfig';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/blog',
    '/features',
    '/privacy',
    '/terms',
    '/cookies',
    '/gdpr',
    '/ccpa',
    '/compress',
    '/compress-jpeg',
    '/compress-png',
    '/compress-webp',
    '/compress-avif',
    '/compress-pdf',
    '/batch-compress',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
