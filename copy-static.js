const fs = require('fs-extra')
const path = require('path')

async function copyFiles() {
  try {
    const sourceDir = path.join(process.cwd(), '.next', 'static')
    const targetDir = path.join(process.cwd(), '.next', '_next', 'static')
    
    // Ensure target directory exists
    await fs.ensureDir(path.dirname(targetDir))
    
    // Copy static files
    await fs.copy(sourceDir, targetDir)
    console.log('Static files copied successfully')
  } catch (error) {
    console.log('Copy operation not needed or failed:', error.message)
  }
}

copyFiles()
