/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  // PWA is configured below
};

// Only wrap with PWA in production to avoid dev issues
let config = nextConfig;

try {
  const withPWA = require("next-pwa")({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
    fallbacks: {
      document: "/offline",
    },
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "supabase-api-cache",
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-resources",
          expiration: { maxEntries: 200, maxAgeSeconds: 86400 * 30 },
        },
      },
      {
        urlPattern: /\/_next\/image\?.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-image-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 86400 * 7 },
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: { maxEntries: 60, maxAgeSeconds: 86400 * 7 },
        },
      },
    ],
  });
  config = withPWA(nextConfig);
} catch (e) {
  console.warn("next-pwa not available, running without PWA");
}

module.exports = config;
