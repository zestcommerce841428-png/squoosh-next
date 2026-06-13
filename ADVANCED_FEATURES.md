# Advanced Features Documentation

## Overview
This document covers the advanced features added to Squoosh Next, including internationalization, analytics, and security enhancements.

---

## 🌍 Language Switcher (Internationalization)

### Features
- **38 Languages** across 6 global regions:
  - Americas (8 languages)
  - Europe (15 languages)
  - Asia (8 languages)
  - Middle East (3 languages)
  - Africa (2 languages)
  - Oceania (2 languages)

### Implementation
The language switcher is located in the header navigation bar and provides:
- **Flag Emojis**: Visual identification of each language
- **Native Names**: Languages displayed in their native script
- **Auto-Detection**: Automatically detects browser language on first visit
- **Persistent Selection**: Stores preference in localStorage
- **Search Functionality**: Quick filter to find languages
- **Grouped by Region**: Organized dropdown for easy navigation

### Supported Languages
```
🇺🇸 English (US), 🇬🇧 English (UK), 🇪🇸 Spanish, 🇫🇷 French, 🇩🇪 German, 🇮🇹 Italian,
🇵🇹 Portuguese, 🇳🇱 Dutch, 🇷🇺 Russian, 🇵🇱 Polish, 🇹🇷 Turkish, 🇬🇷 Greek,
🇨🇿 Czech, 🇸🇪 Swedish, 🇳🇴 Norwegian, 🇩🇰 Danish, 🇫🇮 Finnish, 🇭🇺 Hungarian,
🇷🇴 Romanian, 🇺🇦 Ukrainian, 🇨🇳 Chinese (Simplified), 🇹🇼 Chinese (Traditional),
🇯🇵 Japanese, 🇰🇷 Korean, 🇮🇳 Hindi, 🇹🇭 Thai, 🇻🇳 Vietnamese, 🇮🇩 Indonesian,
🇵🇭 Filipino, 🇸🇦 Arabic, 🇮🇷 Persian, 🇮🇱 Hebrew, 🇿🇦 Afrikaans, 🇪🇬 Egyptian Arabic,
🇦🇺 English (Australia), 🇳🇿 English (New Zealand)
```

### Usage
```tsx
import LanguageSwitcher from './LanguageSwitcher';

// In your component
<LanguageSwitcher />
```

### Integration Points
- Header navigation (right side, before theme toggle)
- Google Analytics tracking for language changes
- localStorage key: `squoosh_language`

---

## 📊 Google Analytics 4 Integration

### Setup
1. Create a Google Analytics 4 property at [analytics.google.com](https://analytics.google.com)
2. Copy your Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

### Automatic Page Tracking
Page views are automatically tracked via the Next.js Script component in [`app/layout.tsx`](app/layout.tsx:62-77).

### Event Tracking Functions

#### Available Events
```typescript
// Image Compression Tracking
trackImageCompression({
  originalSize: 1000000,      // bytes
  compressedSize: 500000,     // bytes
  format: 'webp',
  quality: 80,
  savings: 50                 // percentage
});

// Batch Compression Tracking
trackBatchCompression({
  fileCount: 10,
  totalOriginalSize: 10000000,
  totalCompressedSize: 5000000,
  format: 'avif'
});

// Format Conversion Tracking
trackFormatConversion({
  inputFormat: 'png',
  outputFormat: 'webp',
  fileSize: 500000
});

// Download Tracking
trackDownload({
  format: 'webp',
  fileSize: 500000,
  compressionRatio: 0.5
});

// Feature Usage Tracking
trackFeatureUsage('resize_tool', {
  width: 1920,
  height: 1080
});

// Error Tracking
trackError('Compression failed', 'WASM module load error');
```

#### Custom Events
```typescript
import { event } from '../lib/analytics';

event('custom_action', {
  event_category: 'User Interaction',
  event_label: 'Button Click',
  value: 1
});
```

### Integration in ImageCompressor
The ImageCompressor component automatically tracks:
- Every successful compression
- Format conversions
- File downloads
- Batch processing operations
- Compression errors

---

## 🔐 Google reCAPTCHA v3 Integration

### Setup
1. Register your site at [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
2. Choose **reCAPTCHA v3** (invisible CAPTCHA)
3. Add your domain (localhost for development)
4. Copy Site Key and Secret Key
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Ld-XXXXXXXXXXXXXXXX
   ```

### Usage

#### Client-Side Token Generation
```typescript
import { executeReCaptcha } from '../lib/recaptcha';

// Execute reCAPTCHA before form submission
const handleSubmit = async () => {
  try {
    const token = await executeReCaptcha('contact_form');
    
    // Send token to backend for verification
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ 
        ...formData, 
        recaptchaToken: token 
      })
    });
  } catch (error) {
    console.error('reCAPTCHA failed:', error);
  }
};
```

#### Server-Side Verification (Backend)
```typescript
import { verifyReCaptcha } from '../lib/recaptcha';

// In your API route
export async function POST(request: Request) {
  const body = await request.json();
  const { recaptchaToken } = body;
  
  // Verify token
  const isValid = await verifyReCaptcha(
    recaptchaToken,
    process.env.RECAPTCHA_SECRET_KEY!
  );
  
  if (!isValid) {
    return Response.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
  }
  
  // Process form...
}
```

### Contact Form Implementation
The contact form at [`/contact`](app/contact/page.tsx) includes:
- reCAPTCHA v3 invisible verification
- Form validation
- Google Analytics event tracking
- Success/error handling
- Beautiful Material-UI design with gradient cards

---

## 🎨 Google AdSense Integration

### Setup
1. Apply for Google AdSense at [google.com/adsense](https://www.google.com/adsense)
2. Get approved (may take a few days)
3. Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
   ```

### Ad Placement
AdSense script is automatically loaded in [`app/layout.tsx`](app/layout.tsx:78-84). Place ad units in your components:

```tsx
<ins className="adsbygoogle"
     style={{ display: 'block' }}
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true" />

<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

---

## 📁 File Structure

```
squoosh-dev/
├── app/
│   ├── layout.tsx                 # GA, AdSense, reCAPTCHA scripts
│   └── contact/
│       └── page.tsx               # Contact form with reCAPTCHA
├── components/
│   ├── Header.tsx                 # Language switcher integration
│   ├── LanguageSwitcher.tsx       # 38-language selector
│   └── ImageCompressor.tsx        # Analytics tracking integration
├── lib/
│   ├── analytics.ts               # GA4 helper functions
│   └── recaptcha.ts               # reCAPTCHA utilities
└── .env.local.example             # Environment variable template
```

---

## 🚀 Getting Started

### 1. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google AdSense
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX

# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Ld-XXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6Ld-XXXXXXXXXXXXXXXX
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔍 Testing Features

### Language Switcher
1. Navigate to any page
2. Click the language icon (🌐) in the header
3. Select a language from the dropdown
4. Observe localStorage update and GA event tracking

### Google Analytics
1. Open browser DevTools > Network tab
2. Filter by "google-analytics" or "gtag"
3. Perform actions (compress image, download, etc.)
4. Verify events sent to GA4
5. Check Real-Time reports in Google Analytics

### reCAPTCHA
1. Go to `/contact` page
2. Fill out the contact form
3. Submit the form
4. Check browser console for reCAPTCHA execution
5. Verify token generation (no visible CAPTCHA challenge)

---

## 🛡️ Security Best Practices

### Environment Variables
- **NEVER** commit `.env.local` to Git
- Keep secret keys (reCAPTCHA Secret) on server-side only
- Use `NEXT_PUBLIC_` prefix only for client-safe values

### reCAPTCHA
- Always verify tokens server-side
- Set score threshold (0.5 recommended)
- Log suspicious activity
- Implement rate limiting

### Analytics
- Avoid tracking PII (Personally Identifiable Information)
- Follow GDPR/CCPA compliance
- Provide cookie consent banner if required
- Review data retention settings

---

## 📈 Analytics Dashboard

### Key Metrics to Track
1. **Compression Stats**
   - Total compressions
   - Average savings percentage
   - Most popular output formats
   - Compression quality distribution

2. **User Engagement**
   - Language preferences
   - Feature usage patterns
   - Download frequency
   - Session duration

3. **Performance**
   - Error rates
   - Conversion success rates
   - Browser compatibility issues

### Custom Reports
Create custom reports in Google Analytics:
- Top languages by region
- Compression format trends
- Error frequency by browser
- User journey through features

---

## 🐛 Troubleshooting

### Language Switcher Not Appearing
- Check if `LanguageSwitcher` is imported in Header.tsx
- Verify component renders without errors
- Check browser console for React errors

### Analytics Not Tracking
- Verify `NEXT_PUBLIC_GA_ID` is set correctly
- Check GA4 property is active
- Wait 24-48 hours for data to appear
- Use Real-Time reports for immediate feedback
- Check ad blockers aren't blocking GA scripts

### reCAPTCHA Errors
- Verify site key matches domain
- Check HTTPS is enabled (required for production)
- Add localhost to reCAPTCHA admin for development
- Verify script loaded successfully
- Check browser console for specific errors

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📝 API Reference

### Analytics Functions
See [`lib/analytics.ts`](lib/analytics.ts) for complete API documentation.

### reCAPTCHA Functions
See [`lib/recaptcha.ts`](lib/recaptcha.ts) for complete API documentation.

### Language Switcher Props
See [`components/LanguageSwitcher.tsx`](components/LanguageSwitcher.tsx) for component API.

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Server-side i18n with translations
- [ ] A/B testing framework
- [ ] Advanced analytics dashboard
- [ ] Custom reCAPTCHA theming
- [ ] Multi-factor authentication
- [ ] User accounts and profiles
- [ ] Cloud storage integration
- [ ] API rate limiting
- [ ] Webhook notifications

---

## 📞 Support

For questions or issues:
- **Email**: contact@zestcommerce.in
- **Phone**: +91 74920 68998
- **Website**: [zesttechsolution.cloud](https://zesttechsolution.cloud)
- **Developer**: Naushad Alam

---

## 📄 License

Copyright © 2024 Zest Tech Solution. All rights reserved.

Built with ❤️ by [Naushad Alam](https://zesttechsolution.cloud)
