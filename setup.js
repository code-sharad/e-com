#!/usr/bin/env node

/**
 * Global Saanvika E-commerce Setup Script
 * Helps configure environment and validate setup
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function setupEnvironment() {
  log('\n🚀 Global Saanvika E-commerce Setup', 'cyan');
  log('=====================================\n', 'cyan');

  // Check if .env.local exists
  const envExists = await checkFileExists('.env.local');
  
  if (envExists) {
    log('✅ .env.local file already exists', 'green');
    const overwrite = await question('Do you want to reconfigure? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('Setup cancelled.', 'yellow');
      rl.close();
      return;
    }
  }

  log('📝 Let\'s configure your environment variables...\n', 'blue');

  // Firebase Configuration
  log('🔥 Firebase Configuration', 'magenta');
  log('Get these values from Firebase Console > Project Settings > General', 'yellow');
  
  const firebaseConfig = {
    apiKey: await question('Firebase API Key: '),
    authDomain: await question('Firebase Auth Domain: '),
    projectId: await question('Firebase Project ID: '),
    storageBucket: await question('Firebase Storage Bucket: '),
    messagingSenderId: await question('Firebase Messaging Sender ID: '),
    appId: await question('Firebase App ID: ')
  };

  log('\n💳 Razorpay Configuration', 'magenta');
  log('Get these values from Razorpay Dashboard > Settings > API Keys', 'yellow');
  
  const razorpayConfig = {
    keyId: await question('Razorpay Key ID: '),
    keySecret: await question('Razorpay Key Secret: ')
  };

  // Generate .env.local content
  const envContent = `# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=${firebaseConfig.apiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${firebaseConfig.authDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${firebaseConfig.storageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${firebaseConfig.messagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${firebaseConfig.appId}

# Razorpay Configuration
RAZORPAY_KEY_ID=${razorpayConfig.keyId}
RAZORPAY_KEY_SECRET=${razorpayConfig.keySecret}
NEXT_PUBLIC_RAZORPAY_KEY_ID=${razorpayConfig.keyId}
`;

  // Write .env.local file
  try {
    await fs.promises.writeFile('.env.local', envContent);
    log('\n✅ .env.local file created successfully!', 'green');
  } catch (error) {
    log('\n❌ Error creating .env.local file:', 'red');
    log(error.message, 'red');
    rl.close();
    return;
  }

  // Next steps
  log('\n🎉 Setup Complete!', 'green');
  log('\nNext steps:', 'blue');
  log('1. Start the development server: npm run dev', 'yellow');
  log('2. Visit http://localhost:3000 to see your app', 'yellow');
  log('3. Test Firebase connection in the admin panel', 'yellow');
  log('4. Configure Firebase security rules for production', 'yellow');
  
  rl.close();
}

async function validateSetup() {
  log('\n🔍 Validating Setup...', 'cyan');
  
  const checks = [
    {
      name: 'package.json exists',
      check: () => checkFileExists('package.json')
    },
    {
      name: '.env.local exists',
      check: () => checkFileExists('.env.local')
    },
    {
      name: 'node_modules exists',
      check: () => checkFileExists('node_modules')
    },
    {
      name: 'next.config.js exists',
      check: () => checkFileExists('next.config.js')
    }
  ];

  for (const check of checks) {
    const result = await check.check();
    log(`${result ? '✅' : '❌'} ${check.name}`, result ? 'green' : 'red');
  }

  // Check environment variables
  if (await checkFileExists('.env.local')) {
    const envContent = await fs.promises.readFile('.env.local', 'utf8');
    const requiredVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'RAZORPAY_KEY_ID'
    ];

    log('\n📋 Environment Variables:', 'blue');
    requiredVars.forEach(varName => {
      const hasVar = envContent.includes(varName);
      log(`${hasVar ? '✅' : '❌'} ${varName}`, hasVar ? 'green' : 'red');
    });
  }

  log('\nValidation complete!', 'green');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--validate') || args.includes('-v')) {
    await validateSetup();
  } else if (args.includes('--help') || args.includes('-h')) {
    log('\nGlobal Saanvika E-commerce Setup Script', 'cyan');
    log('=====================================', 'cyan');
    log('\nUsage:', 'blue');
    log('  node setup.js           - Run interactive setup', 'yellow');
    log('  node setup.js --validate - Validate current setup', 'yellow');
    log('  node setup.js --help     - Show this help', 'yellow');
    log('');
  } else {
    await setupEnvironment();
  }
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
