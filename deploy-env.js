#!/usr/bin/env node

/**
 * Deploy Environment Variables to Netlify
 * This script sets up all required environment variables for production deployment
 */

const { execSync } = require('child_process');

console.log('🚀 Setting up environment variables for Netlify deployment...\n');

// Firebase Configuration (from your Firebase project)
const firebaseVars = [
  {
    key: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    value: 'AIzaSyA_IrpHC1dXG4UZVdfubnHtGTAj8Q1KiTU',
    description: 'Firebase API Key'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    value: 'e-com-620fe.firebaseapp.com',
    description: 'Firebase Auth Domain'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    value: 'e-com-620fe',
    description: 'Firebase Project ID'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    value: 'e-com-620fe.appspot.com',
    description: 'Firebase Storage Bucket'
  },  {
    key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    value: '829977668997',
    description: 'Firebase Messaging Sender ID'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_APP_ID',
    value: '1:829977668997:web:c27a7fc8594bca51c7e8ec',
    description: 'Firebase App ID'
  },
  {
    key: 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
    value: 'G-R8H21DPW4X',
    description: 'Firebase Measurement ID'
  }
];

// Site Configuration
const siteVars = [
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    value: 'https://gsanvika.netlify.app',
    description: 'Production Site URL'
  }
];

// Razorpay Configuration (you'll need to add your actual keys)
const razorpayVars = [
  {
    key: 'NEXT_PUBLIC_RAZORPAY_KEY_ID',
    value: 'rzp_test_placeholder', // Replace with your actual test key
    description: 'Razorpay Test Key ID (Replace with actual)'
  },
  {
    key: 'RAZORPAY_KEY_SECRET',
    value: 'placeholder_secret', // Replace with your actual secret
    description: 'Razorpay Secret Key (Replace with actual)'
  }
];

const allVars = [...firebaseVars, ...siteVars, ...razorpayVars];

function setEnvVar(key, value, description) {
  try {
    console.log(`📝 Setting ${description}...`);
    execSync(`netlify env:set ${key} "${value}"`, { stdio: 'inherit' });
    console.log(`✅ Set ${key}\n`);
  } catch (error) {
    console.error(`❌ Failed to set ${key}:`, error.message);
  }
}

function main() {
  console.log('Setting Firebase configuration...');
  firebaseVars.forEach(({ key, value, description }) => {
    setEnvVar(key, value, description);
  });

  console.log('Setting site configuration...');
  siteVars.forEach(({ key, value, description }) => {
    setEnvVar(key, value, description);
  });

  console.log('⚠️  IMPORTANT: Razorpay Configuration Needed!');
  console.log('Please update these Razorpay keys with your actual values:');
  razorpayVars.forEach(({ key, description }) => {
    console.log(`   - ${key}: ${description}`);
  });
  
  console.log('\n🎉 Environment setup complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Add your actual Razorpay keys in Netlify dashboard');
  console.log('2. Add Netlify domain to Firebase Auth authorized domains');
  console.log('3. Test your deployed site');
  console.log('\n🌐 Your site: https://gsanvika.netlify.app');
}

if (require.main === module) {
  main();
}

module.exports = { setEnvVar, allVars };
