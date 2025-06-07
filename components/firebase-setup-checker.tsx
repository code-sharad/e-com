"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { FirebaseValidator } from '@/lib/firebase-validator'

type ValidationResult = Awaited<ReturnType<typeof FirebaseValidator.runFullValidation>>

export function FirebaseSetupChecker() {
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runValidation = async () => {
    setIsLoading(true)
    try {
      const result = await FirebaseValidator.runFullValidation()
      setValidation(result)
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runValidation()
  }, [])

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "✓ OK" : "✗ Failed"}
      </Badge>
    )
  }

  if (!validation && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Firebase Setup Checker</CardTitle>
          <CardDescription>
            Click to validate your Firebase configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runValidation}>
            Check Firebase Setup
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🔥 Firebase Setup Status
              {validation?.overall ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardTitle>
            <CardDescription>
              Comprehensive validation of your Firebase configuration
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runValidation}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {validation?.overall ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                🎉 <strong>Firebase is fully configured and ready!</strong> Your e-commerce platform is connected to all Firebase services.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Configuration Issues Detected:</strong> Please check the details below to complete your Firebase setup.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Environment Configuration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(validation?.config.overall || false)}
                  Environment Variables
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>API Key</span>
                  {getStatusBadge(validation?.config.hasApiKey || false)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Auth Domain</span>
                  {getStatusBadge(validation?.config.hasAuthDomain || false)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Project ID</span>
                  {getStatusBadge(validation?.config.hasProjectId || false)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Storage Bucket</span>
                  {getStatusBadge(validation?.config.hasStorageBucket || false)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>App ID</span>
                  {getStatusBadge(validation?.config.hasAppId || false)}
                </div>
              </CardContent>
            </Card>

            {/* Services Initialization */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(validation?.services.overall || false)}
                  Firebase Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Authentication</span>
                  {getStatusBadge(validation?.services.auth || false)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Firestore</span>
                  {getStatusBadge(validation?.services.firestore || false)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Storage</span>
                  {getStatusBadge(validation?.services.storage || false)}
                </div>
              </CardContent>
            </Card>

            {/* Authentication Test */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(validation?.auth.overall || false)}
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Auth State Detection</span>
                  {getStatusBadge(validation?.auth.authStateDetected || false)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Auth Methods Available</span>
                  {getStatusBadge(validation?.auth.canSignInAnonymously || false)}
                </div>
              </CardContent>
            </Card>

            {/* Firestore Test */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(validation?.firestore.overall || false)}
                  Firestore Database
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Connection</span>
                  {getStatusBadge(validation?.firestore.canConnect || false)}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Write Methods</span>
                  {getStatusBadge(validation?.firestore.canWrite || false)}
                </div>
              </CardContent>
            </Card>
          </div>

          {!validation?.overall && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {!validation?.config.overall && (
                    <li>Add missing environment variables to your .env file</li>
                  )}
                  {!validation?.services.overall && (
                    <li>Check your Firebase project configuration</li>
                  )}
                  {!validation?.auth.overall && (
                    <li>Enable Authentication in Firebase Console</li>
                  )}
                  {!validation?.firestore.overall && (
                    <li>Create Firestore database in Firebase Console</li>
                  )}
                  {!validation?.storage.overall && (
                    <li>Enable Storage in Firebase Console</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
