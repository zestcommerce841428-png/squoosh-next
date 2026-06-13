import type { ReactNode } from 'react';
import ThemeRegistry from 'components/ThemeRegistry';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import Header from 'components/Header';
import Footer from 'components/Footer';
import FloatingDashboard from 'components/FloatingDashboard';
import { Box } from '@mui/material';
import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'Squoosh Next - Premium Image Compressor by Zest Tech Solution',
  description: 'A professional, secure client-side image compression web app by Zest Tech Solution (Naushad Alam). Compress, resize, and convert JPEG, PNG, WebP, AVIF, and 100+ image formats instantly.',
  keywords: 'image compressor, client-side compressor, squoosh next, naushad alam, zest tech solution, avif, webp, jpeg, png, image optimization, developer tools',
  authors: [{ name: 'Naushad Alam', url: 'https://zesttechsolution.cloud' }],
  creator: 'Naushad Alam',
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
    "creator": {
      "@type": "Person",
      "name": "Naushad Alam",
      "email": "contact@zestcommerce.in",
      "telephone": "+917492068998",
      "jobTitle": "Lead Developer & Founder",
      "worksFor": {
        "@type": "Organization",
        "name": "Zest Tech Solution"
      }
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Schema.org structured data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        {/* Google Analytics Integration */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* Google Adsense Integration */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* Google reCAPTCHA v3 Integration */}
        <Script
          src="https://www.google.com/recaptcha/api.js?render=6Ld-XXXXXXXXXXXXXXXX"
          strategy="afterInteractive"
        />

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
