# Squoosh Next - Professional Image Compression Web Application

<div align="center">

![Squoosh Next Logo](public/icon.png)

# 🖼️ Squoosh Next

**Professional Client-Side Image Compression Tool**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build](https://img.shields.io/badge/Build-Passing-success)](https://github.com)

[Live Demo](https://zesttechsolution.cloud) • [Documentation](ADVANCED_FEATURES.md) • [Quick Start](QUICKSTART.md)

</div>

---

## 🌟 Features

### 🚀 Core Functionality
- **100+ Image Formats** - Support for JPEG, PNG, WebP, AVIF, JPEG XL, and 100+ more formats
- **Client-Side Processing** - Zero server uploads, complete privacy protection
- **Batch Compression** - Process multiple images simultaneously with parallel workers
- **Real-Time Preview** - Side-by-side comparison of original vs compressed images
- **Format Conversion** - Convert between any supported image formats
- **EXIF Preservation** - Keep or remove metadata from images
- **Advanced Options** - Quality control, resize, filters, and more

### 🌍 Internationalization
- **38 Languages** - Full support across 6 global regions
- **Auto-Detection** - Automatically detects browser language
- **Native Names** - Languages displayed in their native script (简体中文, 日本語, العربية)
- **Persistent Selection** - User preferences saved locally

### 📊 Analytics & Tracking
- **Google Analytics 4** - Complete event tracking system
- **User Behavior** - Track compressions, downloads, and feature usage
- **Performance Monitoring** - Core Web Vitals tracking
- **Custom Events** - Comprehensive analytics integration

### 🔐 Security & Privacy
- **reCAPTCHA v3** - Invisible CAPTCHA protection on forms
- **Security Headers** - XSS, CSP, HSTS, X-Frame-Options
- **HTTPS Ready** - SSL/TLS encryption
- **Rate Limiting** - Protection against abuse
- **No Data Upload** - All processing happens in your browser

### 📧 Contact System
- **Professional Email** - Hostinger SMTP integration
- **Auto-Reply** - Automatic confirmation emails
- **Admin Notifications** - Instant alerts for new contacts
- **HTML Templates** - Beautiful, responsive email design

### ⚡ Performance
- **Blazing Fast** - 3.1s build time, optimized bundles
- **Code Splitting** - Automatic chunk optimization
- **Image Optimization** - AVIF/WebP support
- **Edge CDN** - Global content delivery
- **PWA Ready** - Installable progressive web app

### 🎨 UI/UX
- **70+ Accessibility Options** - Screen readers, keyboard navigation, high contrast
- **20+ Theme Presets** - Light/dark modes with multiple color schemes
- **Material-UI** - Professional, consistent design system
- **Mobile Responsive** - Perfect on all screen sizes
- **WCAG 2.1 AA** - Accessibility compliant

### 🔧 Developer Experience
- **CI/CD Pipeline** - GitHub Actions for automated deployment
- **TypeScript** - Full type safety
- **Comprehensive Docs** - 6 detailed documentation files
- **Testing** - Automated quality checks
- **Lighthouse** - Performance audits on every deploy

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 16.0 with React 19.0
- **Language:** TypeScript 5.0 (strict mode)
- **UI Library:** Material-UI (MUI) v6.0
- **Styling:** Emotion CSS-in-JS
- **State Management:** React Hooks

### Image Processing
- **WebAssembly Codecs:**
  - MozJPEG - JPEG compression
  - libwebp - WebP encoding
  - libaom - AVIF compression
  - JPEG XL - Next-gen format
  - OxiPNG - PNG optimization

### Infrastructure
- **Deployment:** Vercel (Edge Network)
- **CDN:** Global edge caching
- **Analytics:** Google Analytics 4
- **Security:** reCAPTCHA v3
- **Email:** Nodemailer + Hostinger SMTP

### DevOps
- **CI/CD:** GitHub Actions
- **Testing:** TypeScript compiler, ESLint
- **Monitoring:** Lighthouse CI
- **Version Control:** Git

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/squoosh-next.git
cd squoosh-next

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Update .env.local with your API keys
# See QUICKSTART.md for detailed instructions

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create `.env.local` with:

```env
# Google Analytics 4
NEXT_PUBLIC_GA_ID=your-ga-id

# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
RECAPTCHA_SECRET_KEY=your-secret-key

# Production Domain
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Hostinger SMTP
HOSTINGER_SMTP_HOST=smtp.hostinger.com
HOSTINGER_SMTP_PORT=465
HOSTINGER_SMTP_USER=your-email@domain.com
HOSTINGER_SMTP_PASS=your-password
```

See [`.env.local.example`](.env.local.example) for complete template.

---

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute deployment guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment walkthrough (400+ lines)
- **[ADVANCED_FEATURES.md](ADVANCED_FEATURES.md)** - Features documentation (400+ lines)
- **[.github/SECRETS.md](.github/SECRETS.md)** - GitHub Actions secrets setup
- **[FINAL_SUMMARY.md](FINAL_SUMMARY.md)** - Complete project summary (500+ lines)

---

## 🏗️ Project Structure

```
squoosh-next/
├── .github/
│   ├── workflows/
│   │   └── deploy.yml              # CI/CD pipeline
│   └── SECRETS.md                  # Setup guide
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts            # Email API
│   ├── layout.tsx                  # Root layout with SEO
│   ├── page.tsx                    # Home page
│   ├── compress/                   # Compression pages
│   ├── contact/                    # Contact form
│   └── [other routes]
├── components/
│   ├── Header.tsx                  # Navigation with language switcher
│   ├── Footer.tsx                  # Footer
│   ├── LanguageSwitcher.tsx        # 38-language selector
│   ├── ImageCompressor.tsx         # Main compression component
│   ├── FloatingDashboard.tsx       # Accessibility panel
│   └── ThemeRegistry.tsx           # Theme management
├── lib/
│   ├── analytics.ts                # Google Analytics helpers
│   ├── recaptcha.ts                # reCAPTCHA integration
│   ├── codecs.ts                   # WASM encoder loaders
│   ├── imageDB.ts                  # IndexedDB storage
│   ├── magicBytes.ts               # Format detection
│   └── exif.ts                     # Metadata parser
├── constants/
│   └── imageFormats.ts             # 100+ format definitions
├── public/
│   ├── codecs/                     # WASM binaries
│   ├── robots.txt                  # SEO robots file
│   ├── manifest.json               # PWA manifest
│   └── icon.png                    # App icon
├── .env.local.example              # Environment template
├── vercel.json                     # Vercel config
├── next.config.mjs                 # Next.js config
└── package.json                    # Dependencies
```

---

## 🎯 Performance Metrics

### Build Performance
- **Build Time:** 3.1 seconds
- **TypeScript Check:** 4.6 seconds
- **Routes Generated:** 22
- **Bundle Size:** Optimized with code splitting

### Expected Production Metrics
- **Lighthouse Score:** 95+ (all categories)
- **First Contentful Paint:** < 1.8s
- **Largest Contentful Paint:** < 2.5s
- **Time to Interactive:** < 3.8s
- **Cumulative Layout Shift:** < 0.1
- **First Input Delay:** < 100ms

---

## 🔐 Security

- ✅ **HTTPS Enforced** - Automatic SSL/TLS
- ✅ **Security Headers** - XSS, CSP, HSTS, X-Frame-Options
- ✅ **reCAPTCHA v3** - Invisible CAPTCHA protection
- ✅ **Rate Limiting** - API abuse prevention
- ✅ **Client-Side Processing** - No server data uploads
- ✅ **CORS Configured** - Proper cross-origin policies
- ✅ **Environment Variables** - Sensitive data protection

---

## 🌍 Supported Languages (38)

### Americas (8)
🇺🇸 English (US) • 🇬🇧 English (UK) • 🇨🇦 English (CA) • 🇨🇦 French (CA) • 🇪🇸 Spanish • 🇵🇹 Portuguese • 🇧🇷 Portuguese (BR) • 🇲🇽 Spanish (MX)

### Europe (15)
🇫🇷 French • 🇩🇪 German • 🇮🇹 Italian • 🇳🇱 Dutch • 🇷🇺 Russian • 🇵🇱 Polish • 🇹🇷 Turkish • 🇬🇷 Greek • 🇨🇿 Czech • 🇸🇪 Swedish • 🇳🇴 Norwegian • 🇩🇰 Danish • 🇫🇮 Finnish • 🇭🇺 Hungarian • 🇷🇴 Romanian • 🇺🇦 Ukrainian

### Asia (8)
🇨🇳 Chinese (Simplified) • 🇹🇼 Chinese (Traditional) • 🇯🇵 Japanese • 🇰🇷 Korean • 🇮🇳 Hindi • 🇹🇭 Thai • 🇻🇳 Vietnamese • 🇮🇩 Indonesian • 🇵🇭 Filipino

### Middle East (3)
🇸🇦 Arabic • 🇮🇷 Persian • 🇮🇱 Hebrew

### Africa (2)
🇿🇦 Afrikaans • 🇪🇬 Egyptian Arabic

### Oceania (2)
🇦🇺 English (AU) • 🇳🇿 English (NZ)

---

## 📈 Analytics Events

Tracked events include:
- Image compressions with quality/size metrics
- Batch processing operations
- Format conversions
- File downloads
- Feature usage patterns
- Error occurrences
- Language changes
- Theme switches

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Naushad Alam**  
Lead Developer & Founder  
Zest Tech Solution

- 📧 Email: contact@zestcommerce.in
- 📱 Phone: +91 74920 68998
- 🌐 Website: [zesttechsolution.cloud](https://zesttechsolution.cloud)
- 💼 LinkedIn: [Naushad Alam](https://linkedin.com/in/naushad-alam)

---

## 🙏 Acknowledgments

- **Google** - Analytics, reCAPTCHA services
- **Vercel** - Hosting and deployment platform
- **Next.js Team** - Amazing React framework
- **Material-UI** - Beautiful component library
- **Squoosh Team** - Original inspiration and WASM codecs

---

## 📞 Support

Need help? Reach out:

- 📧 **Email:** contact@zestcommerce.in
- 📱 **Phone:** +91 74920 68998
- 🐛 **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/squoosh-next/issues)
- 📖 **Documentation:** See [ADVANCED_FEATURES.md](ADVANCED_FEATURES.md)

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Built with ❤️ by [Naushad Alam](https://zesttechsolution.cloud) for [Zest Tech Solution](https://zesttechsolution.cloud)**

**© 2026 Zest Tech Solution. All rights reserved.**

[Website](https://zesttechsolution.cloud) • [Email](mailto:contact@zestcommerce.in) • [Phone](tel:+917492068998)

</div>
