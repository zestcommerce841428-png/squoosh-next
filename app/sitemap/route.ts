import { MetadataRoute } from 'next';

/**
 * Dynamic XML Sitemap Generator
 * Automatically generates sitemap.xml with all routes, pages, and content
 * Supports priority, changefreq, and lastmod metadata
 */

interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: {
    languages?: Record<string, string>;
  };
}

// Static routes configuration
const STATIC_ROUTES: Omit<SitemapEntry, 'url'>[] = [
  {
    changeFrequency: 'daily',
    priority: 1.0,
    lastModified: new Date(),
  },
  {
    changeFrequency: 'weekly',
    priority: 0.9,
    lastModified: new Date(),
  },
  {
    changeFrequency: 'monthly',
    priority: 0.7,
    lastModified: new Date(),
  },
  {
    changeFrequency: 'monthly',
    priority: 0.6,
    lastModified: new Date(),
  },
  {
    changeFrequency: 'monthly',
    priority: 0.5,
    lastModified: new Date(),
  },
];

// Route paths mapping
const ROUTES = [
  '/',
  '/compress',
  '/about',
  '/contact',
  '/privacy',
];

// Supported languages for multilingual sitemap
const SUPPORTED_LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko',
  'ar', 'hi', 'bn', 'pa', 'te', 'mr', 'ta', 'ur', 'gu', 'kn',
  'ml', 'or', 'as', 'ne', 'si', 'my', 'th', 'vi', 'id', 'ms',
  'tl', 'sw', 'ha', 'yo', 'ig', 'zu', 'xh', 'af', 'am', 'ti'
];

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zesttechsolution.cloud';

export async function GET() {
  // Generate sitemap entries
  const sitemap: SitemapEntry[] = ROUTES.map((route, index) => {
    const config = STATIC_ROUTES[index] || STATIC_ROUTES[STATIC_ROUTES.length - 1];
    
    // Add language alternates for each route
    const alternates: Record<string, string> = {};
    SUPPORTED_LANGUAGES.forEach(lang => {
      alternates[lang] = `${BASE_URL}${route}?lang=${lang}`;
    });

    return {
      url: `${BASE_URL}${route}`,
      lastModified: config.lastModified,
      changeFrequency: config.changeFrequency,
      priority: config.priority,
      alternates: {
        languages: alternates,
      },
    };
  });

  // Additional dynamic routes (e.g., blog posts, documentation)
  // Can be extended to fetch from database or CMS
  const additionalRoutes: SitemapEntry[] = [
    {
      url: `${BASE_URL}/docs/getting-started`,
      lastModified: new Date('2024-01-15'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/docs/api-reference`,
      lastModified: new Date('2024-01-15'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  const allEntries = [...sitemap, ...additionalRoutes];

  // Generate XML manually for better control
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allEntries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    ${entry.lastModified ? `<lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>` : ''}
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${entry.priority !== undefined ? `<priority>${entry.priority.toFixed(1)}</priority>` : ''}
    ${entry.alternates?.languages ? Object.entries(entry.alternates.languages).map(([lang, url]) => 
      `<xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>`
    ).join('\n    ') : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

// Type export for Next.js
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour
