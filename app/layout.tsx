import type { ReactNode } from 'react';
import ThemeRegistry from 'components/ThemeRegistry';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import Header from 'components/Header';
import Footer from 'components/Footer';
import FloatingDashboard from 'components/FloatingDashboard';
import { Box } from '@mui/material';
import Script from 'next/script';
import './globals.css';

// Environment variable for Google Analytics
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export const metadata = {
  metadataBase: new URL('https://zesttechsolution.cloud'),
  title: {
    default: 'Squoosh Next - Premium Image Compressor by Zest Tech Solution',
    template: '%s | Squoosh Next'
  },
  description: 'Professional client-side image compression tool by Zest Tech Solution (Naushad Alam). Compress, resize, and convert JPEG, PNG, WebP, AVIF, and 100+ image formats instantly with zero server uploads. Fast, secure, and privacy-focused.',
  keywords: ['image compressor', 'image compression', 'compress jpeg', 'compress png', 'webp converter', 'avif converter', 'image optimizer', 'client-side compression', 'squoosh next', 'naushad alam', 'zest tech solution', 'free image compressor', 'batch image compression', 'resize images', 'convert image format', 'optimize images'],
  authors: [{ name: 'Naushad Alam', url: 'https://zesttechsolution.cloud' }],
  creator: 'Naushad Alam',
  publisher: 'Zest Tech Solution',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Squoosh Next - Premium Image Compressor',
    description: 'Professional client-side image compression tool. Compress, resize, and convert JPEG, PNG, WebP, AVIF, and 100+ formats instantly. Fast, secure, and privacy-focused.',
    url: 'https://zesttechsolution.cloud',
    siteName: 'Squoosh Next',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://zesttechsolution.cloud/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Squoosh Next - Premium Image Compressor'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Squoosh Next - Premium Image Compressor',
    description: 'Professional client-side image compression. Compress, resize, and convert 100+ image formats instantly. Fast, secure, and privacy-focused.',
    creator: '@NaushadAlam',
    images: ['https://zesttechsolution.cloud/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    bing: 'bing-verification-code',
  },
  alternates: {
    canonical: 'https://zesttechsolution.cloud',
  },
  category: 'technology',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Squoosh Next",
    "url": "https://zesttechsolution.cloud",
    "description": "Premium client-side image compression tool supporting JPEG, PNG, WebP, AVIF, and 100+ file formats without any server uploads.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5 Canvas and Javascript",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Person",
      "name": "Naushad Alam",
      "email": "contact@zestcommerce.in",
      "telephone": "+917492068998",
      "jobTitle": "Lead Developer & Founder",
      "worksFor": {
        "@type": "Organization",
        "name": "Zest Tech Solution",
        "url": "https://zesttechsolution.cloud"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "150"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Viewport for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#667eea" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#090d16" media="(prefers-color-scheme: dark)" />
        
        {/* Google Schema.org structured data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .catch(() => {});
            }
          `}
        </Script>

        {/* Google Analytics Integration */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Google Adsense Integration */}
        {ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        {/* Google reCAPTCHA v3 Integration */}
        {RECAPTCHA_SITE_KEY && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
            strategy="afterInteractive"
          />
        )}

        <AppRouterCacheProvider options={{ key: 'css', enableCssLayer: true }}>
          <ThemeRegistry>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
              <Header />
              <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
              </Box>
              <Footer />
              <FloatingDashboard />
            </Box>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
