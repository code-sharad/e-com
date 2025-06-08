/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Static export for Netlify
  trailingSlash: true,
  output: 'export',
  distDir: 'out',
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Don't use modularizeImports for lucide-react as we're using our custom Icon component
  modularizeImports: {
    // Other libraries can still use this optimization if needed
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for development
    if (dev) {
      config.cache = {
        type: 'filesystem',
        cacheDirectory: '.next/cache/webpack',
      }
    }
    
    // Reduce bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      'react': 'react',
      'react-dom': 'react-dom',
    }
    
    return config
  },
}

export default withBundleAnalyzer(nextConfig)
