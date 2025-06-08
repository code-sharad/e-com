/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Static export for Netlify
  trailingSlash: true,
  output: 'export',
  distDir: 'out',
  
  // Disable problematic experimental features for static export
  experimental: {
    // Remove turbo and other experimental features that might cause issues
  },
  
  // Simplified webpack config
  webpack: (config, { dev, isServer }) => {
    // Only add essential optimizations
    if (dev) {
      config.cache = false; // Disable cache in dev to avoid issues
    }
    
    return config
  },
}

export default nextConfig
