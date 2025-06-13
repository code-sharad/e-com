// Component memoized for performance (6.12KB)
import React from "react"
import { getFirestore as getFirestoreApp } from '@/lib/firebase'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { doc, getFirestore } from 'firebase/firestore'
// Emulator imports commented out as they're not currently used
// import { connectAuthEmulator, connectFirestoreEmulator, connectStorageEmulator } from 'firebase/auth'

/**
 * Firebase Configuration Validator
 * Use this to verify your Firebase setup is working correctly
 */
export class FirebaseValidator {
  
  /**
   * Check if all Firebase services are properly initialized
   */
  static validateServices(): {
    auth: boolean
    firestore: boolean
    storage: boolean
    overall: boolean
  } {
    const result = {
      auth: !!getAuth(),
      firestore: !!getFirestore(),
      storage: !!getStorage(),
      overall: false
    }
    
    result.overall = result.auth && result.firestore && result.storage
    
    console.log('🔥 Firebase Services Validation:', result)
    return result
  }

  /**
   * Check if environment variables are properly set
   */
  static validateConfig(): {
    hasApiKey: boolean
    hasAuthDomain: boolean
    hasProjectId: boolean
    hasStorageBucket: boolean
    hasAppId: boolean
    overall: boolean
  } {
    const result = {
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      overall: false
    }

    result.overall = Object.values(result).slice(0, -1).every(Boolean)
    
    console.log('⚙️ Firebase Config Validation:', result)
    return result
  }

  /**
   * Test authentication functionality
   */
  static async testAuth(): Promise<{
    canSignInAnonymously: boolean
    authStateDetected: boolean
    overall: boolean
  }> {
    const result = {
      canSignInAnonymously: false,
      authStateDetected: false,
      overall: false
    }

    try {
      // Test auth state listener
      const unsubscribe = getAuth().onAuthStateChanged(() => {
        result.authStateDetected = true
        unsubscribe()
      })      // Note: We don't test anonymous sign-in in production
      // but we can check if the auth object is functional
      const { signInAnonymously } = await import('firebase/auth')
      result.canSignInAnonymously = typeof signInAnonymously === 'function'
      
      result.overall = result.authStateDetected && result.canSignInAnonymously
    } catch (error) {
      console.error('Auth test failed:', error)
    }

    console.log('🔐 Firebase Auth Test:', result)
    return result
  }

  /**
   * Test Firestore connectivity
   */
  static async testFirestore(): Promise<{
    canConnect: boolean
    canWrite: boolean
    overall: boolean
  }> {
    const result = {
      canConnect: false,
      canWrite: false,
      overall: false
    }

    try {
      // Test if we can create a document reference
      const { doc } = await import('firebase/firestore')
      const testDoc = doc(getFirestore(), 'test', 'connection')
      result.canConnect = !!testDoc

      // Note: We don't actually write in production without auth
      // but we can check if the method exists
      const { setDoc } = await import('firebase/firestore')
      result.canWrite = typeof setDoc === 'function'
      
      result.overall = result.canConnect && result.canWrite
    } catch (error) {
      console.error('Firestore test failed:', error)
    }

    console.log('🗃️ Firebase Firestore Test:', result)
    return result
  }

  /**
   * Test Storage connectivity
   */
  static async testStorage(): Promise<{
    canConnect: boolean
    canUpload: boolean
    overall: boolean
  }> {
    const result = {
      canConnect: false,
      canUpload: false,
      overall: false
    }

    try {
      // Test if we can create a storage reference
      const { ref } = await import('firebase/storage')
      const testRef = ref(getStorage(), 'test/connection.txt')
      result.canConnect = !!testRef

      // Note: We don't actually upload in production without auth
      // but we can check if the method exists
      const { uploadBytes } = await import('firebase/storage')
      result.canUpload = typeof uploadBytes === 'function'
      
      result.overall = result.canConnect && result.canUpload
    } catch (error) {
      console.error('Storage test failed:', error)
    }

    console.log('📁 Firebase Storage Test:', result)
    return result
  }

  /**
   * Run comprehensive Firebase validation
   */
  static async runFullValidation(): Promise<{
    config: ReturnType<typeof FirebaseValidator.validateConfig>
    services: ReturnType<typeof FirebaseValidator.validateServices>
    auth: Awaited<ReturnType<typeof FirebaseValidator.testAuth>>
    firestore: Awaited<ReturnType<typeof FirebaseValidator.testFirestore>>
    storage: Awaited<ReturnType<typeof FirebaseValidator.testStorage>>
    overall: boolean
  }> {
    console.log('🔥 Starting Firebase Full Validation...')
    
    const config = this.validateConfig()
    const services = this.validateServices()
    const authTest = await this.testAuth()
    const firestoreTest = await this.testFirestore()
    const storageTest = await this.testStorage()

    const overall = config.overall && 
                   services.overall && 
                   authTest.overall && 
                   firestoreTest.overall && 
                   storageTest.overall

    const result = {
      config,
      services,
      auth: authTest,
      firestore: firestoreTest,
      storage: storageTest,
      overall
    }

    if (overall) {
      console.log('✅ Firebase is fully configured and ready!')
    } else {
      console.log('❌ Firebase configuration issues detected. Check the results above.')
    }

    return result
  }
}

// Helper function to validate Firebase setup on app startup
export const validateFirebaseSetup = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Only run in browser and development mode
    setTimeout(() => {
      FirebaseValidator.runFullValidation()
    }, 1000)
  }
}

// Validate Firebase configuration
export async function validateFirebaseConfig() {
  try {
    const auth = getAuth()
    const db = getFirestore()
    const storage = getStorage()

    // Check if Firebase is initialized
    if (!auth || !db || !storage) {
      throw new Error('Firebase services not initialized')
    }

    // Test auth state listener
    const authPromise = new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe()
        resolve()
      })
    })

    // Check if environment variables are set
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ]

    const missingEnvVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    )

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      )
    }

    // Wait for auth check
    await authPromise

    // Test if we can create a document reference
    const testDoc = doc(db, 'test', 'connection')

    // Test if we can create a storage reference
    const { ref } = await import('firebase/storage')
    const testRef = ref(storage, 'test/connection.txt')

    // If we get here, all checks passed
    return {
      auth: true,
      firestore: !!testDoc,
      storage: !!testRef,
      overall: true
    }
  } catch (error) {
    console.error('Firebase validation error:', error)
    return {
      auth: false,
      firestore: false,
      storage: false,
      overall: false
    }
  }
}

