// Firebase initialization with error handling
if (typeof window !== 'undefined') {
  // Client-side initialization
  console.log('✅ Firebase initialization script loaded');
  
  // Firebase modules are now statically imported in the main application
  // This script is for monitoring purposes only
  window.addEventListener('load', () => {
    try {
      console.log('✅ Page loaded, Firebase should be available');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
    }
  });
}
