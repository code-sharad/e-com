const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files in lib directory
const files = glob.sync('lib/**/*.ts', { cwd: process.cwd() });

files.forEach(file => {
  try {
    const filePath = path.join(process.cwd(), file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace await getFirestore() with getFirestore()
    content = content.replace(/await getFirestore\(\)/g, 'getFirestore()');
    
    // Replace await getFirebaseAuth() with getFirebaseAuth()
    content = content.replace(/await getFirebaseAuth\(\)/g, 'getFirebaseAuth()');
    
    // Replace await getFirebaseStorage() with getFirebaseStorage()
    content = content.replace(/await getFirebaseStorage\(\)/g, 'getFirebaseStorage()');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('Firebase async imports fixed!');
