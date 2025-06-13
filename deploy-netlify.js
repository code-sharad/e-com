#!/usr/bin/env node

/**
 * 🚀 Netlify Deployment Script for Global Saanvika E-commerce
 * 
 * This script helps deploy the jewelry e-commerce website to Netlify
 * with proper environment variables and build configuration.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 Netlify Deployment Helper for Global Saanvika E-commerce');
console.log('=' .repeat(60));

// Check if netlify.toml exists
const netlifyConfig = path.join(__dirname, 'netlify.toml');
if (!fs.existsSync(netlifyConfig)) {
  console.error('❌ netlify.toml not found. Please ensure it exists in the root directory.');
  process.exit(1);
}

console.log('✅ netlify.toml configuration found');

// Check if .env.netlify exists for reference
const envNetlify = path.join(__dirname, '.env.netlify');
if (fs.existsSync(envNetlify)) {
  console.log('✅ .env.netlify reference file found');
  console.log('📝 Please ensure all environment variables from .env.netlify are set in Netlify dashboard');
} else {
  console.log('⚠️  .env.netlify reference file not found');
}

// Build the project locally to test
console.log('\n🔨 Testing local build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Local build successful!');
} catch (error) {
  console.error('❌ Local build failed. Please fix errors before deploying.');
  process.exit(1);
}

console.log('\n🚀 Ready for Netlify Deployment!');
console.log('\nNext steps:');
console.log('1. Push your code to GitHub/GitLab/Bitbucket');
console.log('2. Connect your repository to Netlify');
console.log('3. Set environment variables in Netlify dashboard (see .env.netlify)');
console.log('4. Deploy!');

console.log('\n📋 Required Environment Variables for Netlify:');
console.log('• NEXT_PUBLIC_FIREBASE_API_KEY');
console.log('• NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
console.log('• NEXT_PUBLIC_FIREBASE_PROJECT_ID');
console.log('• NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
console.log('• NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
console.log('• NEXT_PUBLIC_FIREBASE_APP_ID');
console.log('• NEXT_PUBLIC_RAZORPAY_KEY_ID');
console.log('• RAZORPAY_KEY_SECRET');

console.log('\n🔧 Build Configuration:');
console.log('• Node version: 18');
console.log('• Build command: npm run build');
console.log('• Publish directory: .next');
console.log('• Using @netlify/plugin-nextjs');

console.log('\n🌐 Netlify deployment configured successfully! ✨');
