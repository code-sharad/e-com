// Firebase initialization with error handling
if (typeof window !== 'undefined') {
  // Client-side initialization
  window.addEventListener('load', () => {
    try {
      // Preload Firebase modules
      import('./lib/firebase').then(firebase => {
        console.log('✅ Firebase SDK loaded successfully');
        firebase.preloadFirebase().catch(console.warn);
      }).catch(error => {
        console.error('❌ Firebase SDK loading failed:', error);
      });
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
    }
  });
}
