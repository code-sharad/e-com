import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore as getFirestoreDb, connectFirestoreEmulator, enableNetwork, type Firestore } from "firebase/firestore"
import { getStorage as getFirebaseStorageInstance, type FirebaseStorage } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA_IrpHC1dXG4UZVdfubnHtGTAj8Q1KiTU",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "e-com-620fe.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "e-com-620fe",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "e-com-620fe.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "829977668997",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:829977668997:web:c27a7fc8594bca51c7e8ec",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-R8H21DPW4X"
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage

// Initialize Firebase
function initializeFirebaseApp() {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  }
  return app
}

// Function to get Firebase Auth instance
export const getFirebaseAuth = () => {
  if (!auth) {
    const firebaseApp = initializeFirebaseApp()
    auth = getAuth(firebaseApp)
  }
  return auth
}

// Function to get Firestore instance
export const getFirestore = () => {
  if (!db) {
    const firebaseApp = initializeFirebaseApp()
    db = getFirestoreDb(firebaseApp)
    
    // Set timeout settings for Firestore operations
    if (typeof window !== "undefined") {
      // Client-side timeout settings
      try {
        enableNetwork(db).catch(error => {
          console.warn("Firestore network enable failed:", error)
        })
      } catch (error) {
        console.warn("Firestore network enable failed:", error)
      }
    }
  }
  return db
}

// Function to get Storage instance
export const getFirebaseStorage = () => {
  if (!storage) {
    const firebaseApp = initializeFirebaseApp()
    storage = getFirebaseStorageInstance(firebaseApp)
  }
  return storage
}

// Export configuration status
export const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== undefined
export const isUsingDemoConfig = !isFirebaseConfigured

// Export a function to preload Firebase
export const preloadFirebase = () => {
  if (typeof window === "undefined") return Promise.resolve()
  
  // Firebase modules are now imported statically, so just initialize
  try {
    initializeFirebaseApp()
    return Promise.resolve()
  } catch (error) {
    console.warn("Firebase preload failed:", error)
    return Promise.reject(error)
  }
}

