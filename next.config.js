/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/**',
      },
    ],
  },
  // Add build timeout configurations
  staticPageGenerationTimeout: 120,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false // Disable crypto polyfill as it's not needed in modern browsers
    }
    
    // Optimize build performance
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      }
    }
    return config
  }
}

module.exports = nextConfig