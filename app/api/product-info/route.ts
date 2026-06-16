import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Best-effort product metadata fetcher. Fetches the given product URL
 * server-side and extracts title, image and price from JSON-LD / OpenGraph /
 * common meta tags. Large retailers (Amazon, Flipkart) often block datacenter
 * IPs or require JS, so this can legitimately return "blocked".
 */
function decode(s: string) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

function metaContent(html: string, prop: string): string | null {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`, 'i');
  const m = html.match(re) || html.match(re2);
  return m ? decode(m[1]) : null;
}

function jsonLdPrice(html: string): { price?: string; currency?: string; title?: string; image?: string } {
  const out: { price?: string; currency?: string; title?: string; image?: string } = {};
  const blocks = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const b of blocks) {
    const json = b.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '').trim();
    try {
      const parsed = JSON.parse(json);
      const items = Array.isArray(parsed) ? parsed : [parsed, ...(parsed['@graph'] || [])];
      for (const it of items) {
        if (it && (it['@type'] === 'Product' || (Array.isArray(it['@type']) && it['@type'].includes('Product')))) {
          out.title = out.title || it.name;
          out.image = out.image || (Array.isArray(it.image) ? it.image[0] : it.image);
          const offers = Array.isArray(it.offers) ? it.offers[0] : it.offers;
          if (offers) { out.price = out.price || String(offers.price ?? offers.lowPrice ?? ''); out.currency = out.currency || offers.priceCurrency; }
        }
      }
    } catch { /* ignore bad JSON-LD */ }
  }
  return out;
}

export async function POST(request: Request) {
  let url: string;
  try { ({ url } = await request.json()); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (!url || !/^https?:\/\//i.test(url)) return NextResponse.json({ error: 'Enter a valid product URL.' }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    if (!res.ok) return NextResponse.json({ error: `The store returned ${res.status}. It may be blocking automated requests.` }, { status: 502 });

    const html = await res.text();
    const ld = jsonLdPrice(html);
    const title = ld.title || metaContent(html, 'og:title') || (html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? null);
    const image = ld.image || metaContent(html, 'og:image');
    let price = ld.price || metaContent(html, 'product:price:amount') || metaContent(html, 'og:price:amount');
    const currency = ld.currency || metaContent(html, 'product:price:currency') || metaContent(html, 'og:price:currency') || '';
    if (!price) {
      const m = html.match(/["']price["']\s*:\s*["']?([\d,.]+)/i);
      if (m) price = m[1];
    }

    if (!title && !price) {
      return NextResponse.json({ error: 'Could not read product data — this store likely blocks bots or needs JavaScript.' }, { status: 422 });
    }
    return NextResponse.json({ title: title?.trim() || null, image: image || null, price: price || null, currency, url });
  } catch {
    return NextResponse.json({ error: 'Could not reach that URL.' }, { status: 502 });
  }
}
