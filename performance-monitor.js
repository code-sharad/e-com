#!/usr/bin/env node

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class PerformanceMonitor {
  constructor() {
    this.startTime = Date.now()
    this.buildTimes = []
    this.logFile = path.join(process.cwd(), 'performance.log')
  }

  log(message) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}\n`
    
    console.log(message)
    fs.appendFileSync(this.logFile, logEntry)
  }

  formatTime(ms) {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  startBuild() {
    this.startTime = Date.now()
    this.log('🚀 Starting Next.js build...')
  }

  endBuild() {
    const buildTime = Date.now() - this.startTime
    this.buildTimes.push(buildTime)
    this.log(`✅ Build completed in ${this.formatTime(buildTime)}`)
    
    if (this.buildTimes.length > 1) {
      const avgTime = this.buildTimes.reduce((a, b) => a + b, 0) / this.buildTimes.length
      const lastFew = this.buildTimes.slice(-3)
      const recentAvg = lastFew.reduce((a, b) => a + b, 0) / lastFew.length
      
      this.log(`📊 Average build time: ${this.formatTime(avgTime)}`)
      this.log(`📈 Recent average (last 3): ${this.formatTime(recentAvg)}`)
    }
  }

  runDev() {
    this.log('🔥 Starting optimized development server...')
    
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true
    })

    let isFirstBuild = true
    
    devProcess.stdout.on('data', (data) => {
      const output = data.toString()
      console.log(output)
      
      // Track compilation times
      if (output.includes('compiled successfully')) {
        if (isFirstBuild) {
          this.log('🎉 Initial compilation completed')
          isFirstBuild = false
        } else {
          this.log('♻️  Hot reload completed')
        }
      }
      
      // Extract compilation time if available
      const timeMatch = output.match(/compiled.*in (\d+\.?\d*)(ms|s)/i)
      if (timeMatch) {
        const time = parseFloat(timeMatch[1])
        const unit = timeMatch[2]
        const timeMs = unit === 's' ? time * 1000 : time
        this.log(`⚡ Compilation time: ${this.formatTime(timeMs)}`)
      }
    })

    devProcess.stderr.on('data', (data) => {
      const error = data.toString()
      if (!error.includes('ExperimentalWarning')) {
        console.error(error)
        this.log(`❌ Error: ${error.trim()}`)
      }
    })

    devProcess.on('close', (code) => {
      this.log(`Development server exited with code ${code}`)
    })
  }

  async analyzeBuild() {
    this.log('📊 Running bundle analysis...')
    
    try {
      const analyzeProcess = spawn('npm', ['run', 'analyze'], {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, ANALYZE: 'true' }
      })
      
      analyzeProcess.on('close', (code) => {
        if (code === 0) {
          this.log('✅ Bundle analysis completed')
        } else {
          this.log(`❌ Bundle analysis failed with code ${code}`)
        }
      })
    } catch (error) {
      this.log(`❌ Bundle analysis error: ${error.message}`)
    }
  }

  showPerformanceSummary() {
    this.log('\n📋 Performance Summary:')
    this.log('='.repeat(50))
    
    if (fs.existsSync('.next/cache')) {
      const cacheStats = fs.statSync('.next/cache')
      this.log(`💾 Cache directory: ${(cacheStats.size / 1024 / 1024).toFixed(2)}MB`)
    }
    
    if (this.buildTimes.length > 0) {
      const fastest = Math.min(...this.buildTimes)
      const slowest = Math.max(...this.buildTimes)
      const average = this.buildTimes.reduce((a, b) => a + b, 0) / this.buildTimes.length
      
      this.log(`⚡ Fastest build: ${this.formatTime(fastest)}`)
      this.log(`🐌 Slowest build: ${this.formatTime(slowest)}`)
      this.log(`📊 Average build: ${this.formatTime(average)}`)
      this.log(`🔢 Total builds: ${this.buildTimes.length}`)
    }
    
    this.log('='.repeat(50))
  }
}

// CLI interface
const monitor = new PerformanceMonitor()

const command = process.argv[2]

switch (command) {
  case 'dev':
    monitor.runDev()
    break
  case 'analyze':
    monitor.analyzeBuild()
    break
  case 'summary':
    monitor.showPerformanceSummary()
    break
  default:
    console.log('Usage: node performance-monitor.js [dev|analyze|summary]')
    console.log('  dev     - Start development server with performance monitoring')
    console.log('  analyze - Run bundle analysis')
    console.log('  summary - Show performance summary')
}

// Handle process termination
process.on('SIGINT', () => {
  monitor.log('\n👋 Performance monitoring stopped')
  monitor.showPerformanceSummary()
  process.exit(0)
})

module.exports = PerformanceMonitor
