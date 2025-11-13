/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'example.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
  // Türkçe karakter desteği ve route optimizasyonu
  experimental: {
    optimizePackageImports: ['@heroicons/react'],
  },
  // Webpack cache uyarılarını azalt
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
  // Türkçe karakterli route'lar için rewrites
  // Middleware ile birlikte çalışır (middleware önce çalışır, rewrites fallback olarak)
  async rewrites() {
    return [
      {
        source: '/%C3%BCr%C3%BCnler/:path*',
        destination: '/ürünler/:path*',
      },
      {
        source: '/%C3%BCr%C3%BCnler',
        destination: '/ürünler',
      },
      {
        source: '/sipari%C5%9Fler/:path*',
        destination: '/siparişler/:path*',
      },
      {
        source: '/sipari%C5%9Fler',
        destination: '/siparişler',
      },
    ]
  },
}

module.exports = nextConfig
