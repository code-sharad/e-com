// Performance optimization configuration
// Components above these thresholds will be considered for dynamic imports
export const PERFORMANCE_THRESHOLDS = {
  // File size threshold for dynamic imports (in KB)
  DYNAMIC_IMPORT_SIZE: 15,
  
  // File size threshold for component memoization (in KB)
  MEMOIZATION_SIZE: 5,
  
  // Maximum icons per import before splitting
  MAX_ICONS_PER_IMPORT: 5,
}

// Components that should always be dynamically imported
export const FORCE_DYNAMIC_IMPORTS = [
  'app/admin/page.tsx',
  'app/admin/reports/page.tsx', 
  'app/admin/products/page.tsx',
  'app/admin/orders/page.tsx',
  'app/checkout/page.tsx',
  'components/ui/chart.tsx',
]

// Components that should not be dynamically imported (critical path)
export const EXCLUDE_DYNAMIC_IMPORTS = [
  'components/navbar.tsx',
  'components/footer.tsx',
  'app/layout.tsx',
  'app/page.tsx',
]

// Webpack bundle analysis settings
export const BUNDLE_ANALYSIS = {
  // Size limit warnings (in KB)
  WARNING_SIZE: 244, // 244KB is the default Next.js warning
  ERROR_SIZE: 488,   // 488KB is the default Next.js error
  
  // Chunk size targets
  MAX_CHUNK_SIZE: 200, // Target max chunk size in KB
}

export const OPTIMIZATION_FEATURES = {
  // Feature flags for different optimizations
  ENABLE_MEMOIZATION: true,
  ENABLE_DYNAMIC_IMPORTS: true,
  ENABLE_ICON_OPTIMIZATION: false, // Disabled due to compatibility issues
  ENABLE_BUNDLE_SPLITTING: true,
  ENABLE_COMPRESSION: true,
}
