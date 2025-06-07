"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import AuthLoading from "@/components/auth-loading"

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { isInitialized } = useAuth()

  // Show loading screen while auth is being initialized
  if (!isInitialized) {
    return <AuthLoading />
  }

  return <>{children}</>
}
