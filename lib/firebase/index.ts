import { initializeApp, getApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth as getFirebaseAuth, type Auth } from 'firebase/auth'
import { getStorage as getFirebaseStorage, type FirebaseStorage } from 'firebase/storage'

// Initialize Firebase app
let app: FirebaseApp;
try {
  app = getApp();
} catch {
  app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

// Initialize services
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _storage: FirebaseStorage | null = null;

// Get Firestore instance
export function getDb(): Firestore {
  if (!_db) {
    _db = getFirestore(app);
  }
  return _db;
}

// Get Auth instance
export function getAppAuth(): Auth {
  if (!_auth) {
    _auth = getFirebaseAuth(app);
  }
  return _auth;
}

// Get Storage instance
export function getAppStorage(): FirebaseStorage {
  if (!_storage) {
    _storage = getFirebaseStorage(app);
  }
  return _storage;
} 
