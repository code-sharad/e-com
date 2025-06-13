// Debug utility for Firebase initialization
export function debugFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "fallback",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fallback",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fallback",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fallback",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "fallback",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "fallback",
  }
  
  console.log("Firebase Configuration Debug:", {
    hasApiKey: !!config.apiKey && config.apiKey !== "fallback",
    hasAuthDomain: !!config.authDomain && config.authDomain !== "fallback",
    hasProjectId: !!config.projectId && config.projectId !== "fallback",
    hasStorageBucket: !!config.storageBucket && config.storageBucket !== "fallback",
    hasSenderId: !!config.messagingSenderId && config.messagingSenderId !== "fallback",
    hasAppId: !!config.appId && config.appId !== "fallback",
    environment: process.env.NODE_ENV,
  })
  
  return config
}

// Export for use in pages if needed
if (typeof window !== "undefined") {
  (window as any).debugFirebase = debugFirebaseConfig
}
