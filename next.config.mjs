/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Empty turbopack config to silence the warning (most apps work without special config)
  turbopack: {},
  // Allow dynamic import() of codec JS glue files from public/codecs/
  // without Webpack trying to bundle them.
  webpack(config, { isServer }) {
    if (!isServer) {
      // Treat WASM files as static assets (served from /public)
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }
    return config;
  },
  // Serve WASM files with the correct MIME type
  async headers() {
    return [
      {
        source: '/codecs/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/wasm' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/codecs/:path*.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript' },
        ],
      },
    ];
  },
};

export default nextConfig;
