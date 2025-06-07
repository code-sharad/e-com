import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA_IrpHC1dXG4UZVdfubnHtGTAj8Q1KiTU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "e-com-620fe.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "e-com-620fe",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "e-com-620fe.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "829977668997",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:829977668997:web:c27a7fc8594bca51c7e8ec",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-R8H21DPW4X"
}

// Initialize Firebase app (avoid duplicate initialization)
let app: FirebaseApp
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
} catch (error) {
  console.error("Firebase initialization error:", error)
  // Fallback initialization
  app = initializeApp(firebaseConfig)
}

// Initialize Firebase services with error handling
let auth: Auth, db: Firestore, storage: FirebaseStorage

try {
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  console.log("🔥 Firebase services initialized successfully")
} catch (error) {
  console.error("Firebase services initialization error:", error)
}

export { auth, db, storage }
export default app

// Export configuration status
export const isFirebaseConfigured = true
export const isUsingDemoConfig = false
