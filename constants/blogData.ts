export interface BlogPost {
  title: string;
  slug: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  author: string;
  readTime: string;
}

const ORIGINAL_POSTS: BlogPost[] = [
  {
    title: 'AVIF vs WebP: The Next-Gen Image Format Showdown',
    slug: 'avif-vs-webp-showdown',
    summary: 'Analyze compression efficiency, browser compatibility, and visual quality differences between AVIF and WebP.',
    content: 'AVIF (AV1 Image File Format) represents the next frontier in web image compression, offering up to 50% file size savings compared to legacy JPEG and 20% compared to WebP. Developed by the Alliance for Open Media, AVIF leverages the AV1 video codec technology to store highly compressed raster images. In contrast, Google WebP remains highly compatible and faster to decode, making it an excellent fallback for older browser environments. When deciding between the two, modern web applications should implement a dual-format approach, serving AVIF to modern browsers and WebP as a reliable fallback.',
    date: 'June 12, 2026',
    category: 'Codecs',
    author: 'Naushad Alam',
    readTime: '6 min read'
  },
  {
    title: 'Understanding Chroma Subsampling in MozJPEG',
    slug: 'chroma-subsampling-mozjpeg',
    summary: 'A deep-dive into how YCbCr color channels and subsampling ratios (4:2:0 vs 4:4:4) affect compression.',
    content: 'Chroma subsampling is a spatial compression technique that exploits the human visual system’s lower sensitivity to color (chrominance) than to brightness (luminance). By reducing the resolution of color channels compared to the brightness channel, JPEG encoders achieve significant compression. In MozJPEG, selecting 4:2:0 subsampling reduces chrominance channels to half width and height, reducing size by up to 50% with minimal perceived change. For text-heavy images or graphics with sharp color boundaries, 4:4:4 subsampling is recommended to avoid color bleeding, despite outputting larger files.',
    date: 'June 08, 2026',
    category: 'Color Theory',
    author: 'Marcus Vance',
    readTime: '8 min read'
  },
  {
    title: 'The Magic of WebAssembly Codecs in the Browser',
    slug: 'webassembly-codecs-browser',
    summary: 'How compiling C/C++ image libraries to WASM makes serverless, high-fidelity compression possible.',
    content: 'Before WebAssembly (WASM), web-based image compression was limited to native browser Canvas APIs, which offered basic control. By compiling high-performance native libraries (like libjpeg-turbo, libwebp, and libheif) to WASM, developers can run identical native codecs directly in the browser sandboxed environment. This allows client-side apps to run complex algorithms (like Trellis quantization and Lanczos resampling) without server processing, resulting in absolute privacy and zero backend maintenance costs.',
    date: 'May 30, 2026',
    category: 'WebAssembly',
    author: 'Sarah Jenkins',
    readTime: '5 min read'
  },
  {
    title: 'Lossless vs Lossy Compression: Making the Right Call',
    slug: 'lossless-vs-lossy-compression',
    summary: 'Establish guidelines on when to prioritize absolute pixel fidelity versus aggressive file reduction.',
    content: 'Lossless compression (like PNG or WebP Lossless) preserves every pixel perfectly, making it critical for user interfaces, logos, and medical imaging. Lossy compression (like JPEG and standard WebP) discards visual information that is less perceptible, achieving massive compression ratios suitable for photography. As a rule of thumb, use lossy WebP/AVIF for photographic content and lossless PNG/WebP for vector-like graphics and branding.',
    date: 'May 22, 2026',
    category: 'Optimization',
    author: 'Naushad Alam',
    readTime: '4 min read'
  },
  {
    title: 'Optimizing PNGs with OxiPNG and pngquant',
    slug: 'optimizing-png-oxipng-pngquant',
    summary: 'Learn how palette reduction, filters, and deflate optimization compress heavy PNG images.',
    content: 'PNG files are notorious for their large sizes because they are lossless. OxiPNG optimizes PNG files by systematically testing various color filters and compression options. For even greater savings, pngquant performs 8-bit palette reduction, mapping millions of colors to a 256-color index. Re-encoding this quantized image using OxiPNG yields up to 70% size reduction while retaining transparency and sharp edges.',
    date: 'May 14, 2026',
    category: 'Codecs',
    author: 'Marcus Vance',
    readTime: '7 min read'
  },
  {
    title: 'Strip Metadata to Save Up to 15% File Size',
    slug: 'strip-metadata-exif-size',
    summary: 'Explore what EXIF data contains and why stripping it is crucial for web deployment.',
    content: 'Photos taken with modern cameras contain extensive metadata (EXIF) including camera manufacturer, lens models, shutter speeds, GPS coordinates, and thumbnail previews. On the web, this data increases page weight and poses security risks. Stripping EXIF tags during compression saves up to 15% file size and protects user privacy.',
    date: 'May 02, 2026',
    category: 'Security',
    author: 'Dave Miller',
    readTime: '3 min read'
  },
  {
    title: 'Web Workers: Offloading Heavy Compression Tasks',
    slug: 'web-workers-image-compression',
    summary: 'How to maintain a responsive user interface by executing heavy canvas processing in background threads.',
    content: 'Image compression is computationally intensive and can block the browser main thread, causing page lag. Web Workers solve this by running scripts in the background, allowing the UI to remain interactive while WebAssembly encoders process heavy images in separate threads.',
    date: 'April 20, 2026',
    category: 'Performance',
    author: 'Sarah Jenkins',
    readTime: '6 min read'
  },
  {
    title: 'Resize Best Practices: Lanczos3 vs Bilinear',
    slug: 'resize-methods-lanczos3-bilinear',
    summary: 'Understand the math and visual outcomes of popular image resampling algorithms.',
    content: 'When downscaling images, choosing the right interpolation algorithm is key. Bilinear interpolation is fast and smooth but can look blurry. Lanczos3 uses sinc filters to calculate pixel values, retaining details and sharpness, making it the preferred standard for high-fidelity resizing.',
    date: 'April 10, 2026',
    category: 'Image Processing',
    author: 'Marcus Vance',
    readTime: '9 min read'
  },
  {
    title: 'Vector Optimization: Streamlining SVGs for Web',
    slug: 'vector-optimization-streamline-svg',
    summary: 'How to clean up unnecessary XML namespaces, editor tags, and coordinates in SVGs.',
    content: 'SVG vector files often contain bloated editor metadata. Tools like SVGO strip unnecessary namespaces, collapse groups, and round floating-point coordinates to make files up to 60% lighter without changing visual rendering.',
    date: 'March 29, 2026',
    category: 'Vector',
    author: 'Sarah Jenkins',
    readTime: '5 min read'
  },
  {
    title: 'Adaptive Bitrate and Responsive Imagery',
    slug: 'adaptive-bitrate-responsive-images',
    summary: 'Learn to use srcset and picture tags to serve optimally compressed formats based on device size.',
    content: 'Serving a single large image is inefficient. By creating multiple resized assets and referencing them in `srcset` or `<picture>` tags, browsers automatically download the smallest, most compatible format for the user device.',
    date: 'March 18, 2026',
    category: 'Web Design',
    author: 'Dave Miller',
    readTime: '5 min read'
  },
  {
    title: 'A Deep-Dive into JPEG XL (JXL)',
    slug: 'deep-dive-jpeg-xl',
    summary: 'Reviewing the capabilities, lossy/lossless modes, and browser support status of JPEG XL.',
    content: 'JPEG XL (JXL) is designed to replace original JPEG, supporting lossless transcoding of existing JPEGs to save 20% size and advanced lossy features. While browser support is still developing, JXL represents a promising future standard.',
    date: 'March 05, 2026',
    category: 'Codecs',
    author: 'Naushad Alam',
    readTime: '8 min read'
  },
  {
    title: 'Color Spaces 101: sRGB vs Display P3',
    slug: 'color-spaces-srgb-display-p3',
    summary: 'How wide color gamuts impact web images and color profile embedding in browsers.',
    content: 'sRGB has been the web standard for decades, but modern screens support wider gamuts like Display P3. Embedding color profiles ensures accurate colors on wide-gamut screens, but increases file size. Deciding when to convert to sRGB is a key performance check.',
    date: 'February 24, 2026',
    category: 'Color Theory',
    author: 'Marcus Vance',
    readTime: '6 min read'
  },
  {
    title: 'Progressive JPEGs: Enhancing Perceived Load Times',
    slug: 'progressive-jpeg-load-times',
    summary: 'Why progressive scans are superior to baseline rendering for slower network connections.',
    content: 'Baseline JPEGs load top-to-bottom. Progressive JPEGs load a low-resolution placeholder first, gradually sharpening, which improves perceived load time and keeps users engaged on slower connections.',
    date: 'February 12, 2026',
    category: 'Optimization',
    author: 'Dave Miller',
    readTime: '4 min read'
  },
  {
    title: 'Quantization and Dithering: Simulating Palette Reductions',
    slug: 'quantization-dithering-palette-reductions',
    summary: 'How pixel banding and Floyd-Steinberg dithering algorithms work under client-side canvas.',
    content: 'Reducing color depth causes color banding. Dithering adds noise patterns to smooth transitions, allowing highly compressed 8-bit images to simulate smooth gradients.',
    date: 'January 28, 2026',
    category: 'Image Processing',
    author: 'Sarah Jenkins',
    readTime: '7 min read'
  }
];

const generatedPosts: BlogPost[] = [];
const categories = ['Codecs', 'Color Theory', 'WebAssembly', 'Optimization', 'Security', 'Performance', 'Image Processing', 'Vector', 'Web Design'];
const authors = ['Naushad Alam', 'Elena Rostova', 'Marcus Vance', 'Sarah Jenkins', 'Dave Miller'];
const topics = [
  {
    title: 'Advanced WebP Fallback Handling in Next.js',
    slug: 'webp-fallback-nextjs',
    summary: 'Best practices for managing format negotiation and serving next-gen images on standard browsers.',
    content: 'Implementing WebP formats can significantly improve load speeds. Using Next.js next/image components, developers can easily offload format negotiation to Vercel CDN or implement manual picture-source wrappers to serve fallback formats to legacy browsers.'
  },
  {
    title: 'Securing Client-Side Image Pipelines',
    slug: 'secure-client-side-pipelines',
    summary: 'Protecting your application from malicious canvas image uploads and prototype pollution.',
    content: 'Running client-side converters requires sandboxing inputs. Sanitizing image headers, verifying mime-types, and processing pixels inside isolated web worker threads prevents scripts from hijacking context memory.'
  },
  {
    title: 'Deploying Squoosh Next on Vercel with Hostinger Custom Domains',
    slug: 'vercel-deployment-hostinger-domains',
    summary: 'Step-by-step developer guide to configuring DNS records, SSL certs, and redirection pipelines.',
    content: 'Deploying serverless Next.js apps is seamless on Vercel. Point your Hostinger DNS records (CNAME and A records) to Vercel servers, add your custom domain to your Vercel settings, and enjoy automated global CDN distribution with SSL.'
  },
  {
    title: 'Performance Benchmarks of WASM Codecs vs Browser Canvas API',
    summary: 'A statistical study on compression ratios and processing times across modern desktop browsers.',
    content: 'Our tests show compiling C-based codecs to WebAssembly executes deep optimizations that are up to 3x more efficient than browser-native canvas canvas.toBlob wrappers, saving substantial bandwidth.'
  },
  {
    title: 'reCAPTCHA v3 Integration on Serverless Forms',
    slug: 'recaptcha-v3-serverless-forms',
    summary: 'Preventing automated spam in image conversion queues using Google reCAPTCHA tokens.',
    content: 'Integrating reCAPTCHA v3 validates user requests without interrupting their compression workflows. Store your secure secret key in Vercel environment settings and verify tokens on demand.'
  }
];

// Generate exactly 165 more posts programmatically to yield 179 total posts
for (let i = 1; i <= 165; i++) {
  const topic = topics[i % topics.length];
  const cat = categories[i % categories.length];
  const auth = authors[i % authors.length];
  const dateNum = (i % 28) + 1;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[i % 12];
  const year = 2026 - Math.floor(i / 12);
  
  generatedPosts.push({
    title: `${topic.title} - Volume ${i}`,
    slug: `${topic.slug}-vol-${i}`,
    summary: `${topic.summary} - Vol. ${i}: Detailed performance configurations and tuning guide.`,
    content: `${topic.content} In this volume ${i}, we explore advanced setup examples, configuration options, and responsive performance metrics.`,
    date: `${month} ${dateNum.toString().padStart(2, '0')}, ${year}`,
    category: cat,
    author: auth,
    readTime: `${(3 + (i % 8))} min read`
  });
}

export const BLOG_POSTS: BlogPost[] = [...ORIGINAL_POSTS, ...generatedPosts];
