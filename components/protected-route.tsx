"use client"

import { useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  redirectTo = "/auth/login" 
}: ProtectedRouteProps) {
  const { user, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isInitialized) return // Wait for auth to initialize

    // If user is not authenticated, redirect to login
    if (!user) {
      router.push(redirectTo)
      return
    }

    // If admin is required and user is not admin, redirect to home
    if (requireAdmin && !user.isAdmin) {
      router.push("/")
      return
    }
  }, [user, isInitialized, requireAdmin, redirectTo, router])

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold-500"></div>
      </div>
    )
  }

  // If user is not authenticated or doesn't have required permissions, don't render children
  if (!user || (requireAdmin && !user.isAdmin)) {
    return null
  }

  return <>{children}</>
}
