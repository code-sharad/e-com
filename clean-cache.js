#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🧹 Cleaning up cache files for better performance...')

const pathsToClean = [
  '.next',
  'out',
  'node_modules/.cache',
  '.next/cache',
  'tsconfig.tsbuildinfo',
  '.eslintcache'
]

pathsToClean.forEach(cleanPath => {
  const fullPath = path.join(process.cwd(), cleanPath)
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath)
      
      if (stats.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true })
        console.log(`✅ Removed directory: ${cleanPath}`)
      } else {
        fs.unlinkSync(fullPath)
        console.log(`✅ Removed file: ${cleanPath}`)
      }
    }
  } catch (error) {
    console.log(`⚠️  Could not remove ${cleanPath}: ${error.message}`)
  }
})

console.log('🚀 Cache cleanup complete! Run "npm run dev" for faster compilation.')