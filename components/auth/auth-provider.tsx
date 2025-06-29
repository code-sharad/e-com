"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useRouter } from "next/navigation"
import { getFirebaseAuth } from "@/lib/firebase"
import { FirebaseAuthService, type UserProfile } from "@/lib/firebase/auth"

interface AuthContextType {
  user: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (email: string, password: string, name: string, phone?: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  // Listen to Firebase auth state changes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initializeAuth = async () => {
      try {
        const auth = await getFirebaseAuth()
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
          try {
            if (firebaseUser) {
              // User is signed in, get their profile
              const userProfile = await FirebaseAuthService.getCurrentUserProfile(firebaseUser)
              setUser(userProfile)
            } else {
              // User is signed out
              setUser(null)
            }
          } catch (error) {
            console.error("Error in auth state change:", error)
            setUser(null)
          } finally {
            setIsInitialized(true)
          }
        })
      } catch (error) {
        console.error("Error initializing auth:", error)
        setIsInitialized(true)
      }
    }

    initializeAuth()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const userProfile = await FirebaseAuthService.login(email, password)
      setUser(userProfile)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
    setIsLoading(false)
  }

  const logout = async () => {
    try {
      await FirebaseAuthService.logout()
      setUser(null)
      // Redirect to login page after logout
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const register = async (email: string, password: string, name: string, phone?: string) => {
    setIsLoading(true)
    try {
      const userProfile = await FirebaseAuthService.register(email, password, name, phone)
      setUser(userProfile)
    } catch (error) {
      setIsLoading(false)
      throw error
    }
    setIsLoading(false)
  }

  const resetPassword = async (email: string) => {
    try {
      await FirebaseAuthService.resetPassword(email)
    } catch (error) {
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialized,
        login,
        logout,
        register,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

