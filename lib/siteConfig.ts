/**
 * Single source of truth for the site's public URL.
 * Change the domain by setting NEXT_PUBLIC_SITE_URL in your env (Vercel + .env.local)
 * — no code changes needed. Falls back to the current production domain.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://zesttechsolution.cloud').replace(/\/+$/, '');

/** Bare domain (no scheme), e.g. "zesttechsolution.cloud" — for display in text. */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, '');
