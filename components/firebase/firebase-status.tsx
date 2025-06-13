"use client"

import { isFirebaseConfigured, isUsingDemoConfig } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertTriangle } from "lucide-react"

export function FirebaseStatus() {
  if (isFirebaseConfigured) {
    return null // Don't show anything when properly configured
  }

  if (isUsingDemoConfig) {
    return (
      <Alert className="mb-4 border-orange-200 bg-orange-50">
        <Info className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Demo Mode:</strong> Firebase is not configured. Using demo data for development.
          <br />
          <span className="text-sm">Add Firebase environment variables to enable full functionality.</span>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <strong>Configuration Required:</strong> Firebase environment variables are missing.
        <br />
        <span className="text-sm">Please add your Firebase configuration to continue.</span>
      </AlertDescription>
    </Alert>
  )
}

