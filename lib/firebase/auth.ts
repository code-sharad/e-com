// Component memoized for performance (6.53KB)
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { getFirebaseAuth, getFirestore } from "@/lib/firebase"

export interface UserProfile {
  uid: string
  email: string
  name: string
  phone?: string
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

export class FirebaseAuthService {
  // Register new user
  static async register(email: string, password: string, name: string, phone?: string): Promise<UserProfile> {
    try {
      const auth = await getFirebaseAuth()
      const db = await getFirestore()
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update display name
      await updateProfile(user, { displayName: name })

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        name,
        isAdmin: email === "admin@globalsaanvika.com", // Make admin@globalsaanvika.com an admin
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Only add phone if it's provided
      if (phone) {
        userProfile.phone = phone
      }

      await setDoc(doc(db, "users", user.uid), userProfile)

      return userProfile
    } catch (error: unknown) {
      console.error("Registration error:", error)
      const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : 'unknown'
      throw new Error(FirebaseAuthService.getErrorMessage(errorCode))
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<UserProfile> {
    try {
      const auth = await getFirebaseAuth()
      const db = await getFirestore()
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        // If user profile doesn't exist, create a basic one
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          name: user.displayName || "User",
          isAdmin: user.email === "admin@globalsaanvika.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await setDoc(doc(db, "users", user.uid), userProfile)
        return userProfile
      }

      const userData = userDoc.data() as UserProfile
      return {
        ...userData,
        createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
        updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(userData.updatedAt),
      }
    } catch (error: unknown) {
      const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : 'unknown'
      throw new Error(FirebaseAuthService.getErrorMessage(errorCode))
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      const auth = await getFirebaseAuth()
      await signOut(auth)
    } catch (error: unknown) {
      console.error("Logout error:", error)
      throw new Error("Failed to logout")
    }
  }

  // Send password reset email
  static async resetPassword(email: string): Promise<void> {
    try {
      const auth = await getFirebaseAuth()
      await sendPasswordResetEmail(auth, email)
    } catch (error: unknown) {
      console.error("Password reset error:", error)
      const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : 'unknown'
      throw new Error(FirebaseAuthService.getErrorMessage(errorCode))
    }
  }

  // Get current user profile
  static async getCurrentUserProfile(user: User): Promise<UserProfile | null> {
    try {
      const db = await getFirestore()
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        return null
      }

      const userData = userDoc.data() as UserProfile
      return {
        ...userData,
        createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
        updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(userData.updatedAt),
      }
    } catch (error) {
      console.error("Error getting user profile:", error)
      return null
    }
  }

  // Update user profile
  static async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const db = await getFirestore()
      await setDoc(
        doc(db, "users", uid),
        {
          ...updates,
          updatedAt: new Date(),
        },
        { merge: true },
      )
    } catch (error) {
      console.error("Error updating user profile:", error)
      throw new Error("Failed to update profile")
    }
  }

  // Convert Firebase error codes to user-friendly messages
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "An account with this email already exists"
      case "auth/invalid-email":
        return "Invalid email address"
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled"
      case "auth/weak-password":
        return "Password should be at least 6 characters"
      case "auth/user-disabled":
        return "This account has been disabled"
      case "auth/user-not-found":
        return "No account found with this email"
      case "auth/wrong-password":
        return "Incorrect password"
      case "auth/invalid-credential":
        return "Invalid email or password"
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later"
      case "auth/invalid-api-key":
        return "Firebase configuration error. Please check your API keys."
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection."
      default:
        return "An error occurred. Please try again"
    }
  }
}

