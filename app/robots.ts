import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/siteConfig';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/sitemap-manager/'],
        crawlDelay: 1,
      },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Googlebot-Image', allow: '/' },
      { userAgent: 'Bingbot', allow: '/', crawlDelay: 1 },
      { userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot'], disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
