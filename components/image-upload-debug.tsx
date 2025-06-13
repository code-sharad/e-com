"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Upload } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { FirebaseStorageService } from '@/lib/firebase/storage'

export function ImageUploadDebug() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [uploadTest, setUploadTest] = useState<{
    status: 'idle' | 'uploading' | 'success' | 'error'
    message: string
    file?: File
  }>({ status: 'idle', message: '' })
  const { user, isInitialized } = useAuth()

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])
    
    const tests = [
      {
        name: 'Authentication Status',
        test: () => ({
          success: !!user && isInitialized,
          message: user ? `Logged in as: ${user.email}` : 'Not authenticated'
        })
      },
      {
        name: 'Firebase Environment Variables',
        test: () => {
          const hasApiKey = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
          const hasStorageBucket = !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
          return {
            success: hasApiKey && hasStorageBucket,
            message: `API Key: ${hasApiKey ? '✓' : '✗'}, Storage Bucket: ${hasStorageBucket ? '✓' : '✗'}`
          }
        }
      },
      {
        name: 'File API Support',
        test: () => ({
          success: typeof File !== 'undefined' && typeof FileReader !== 'undefined',
          message: 'Browser supports File API'
        })
      }
    ]

    for (const test of tests) {
      try {
        const result = await test.test()
        setResults(prev => [...prev, { name: test.name, ...result }])
      } catch (error: any) {
        setResults(prev => [...prev, { 
          name: test.name, 
          success: false, 
          message: error.message 
        }])
      }
      await new Promise(resolve => setTimeout(resolve, 500)) // Delay for visual effect
    }
    
    setIsRunning(false)
  }

  const testImageUpload = async (file: File) => {    setUploadTest({ status: 'uploading', message: 'Uploading test image...', file })
    
    try {
      const url = await FirebaseStorageService.uploadImage(file, 'debug-uploads')
      setUploadTest({ 
        status: 'success', 
        message: `Successfully uploaded: ${url.substring(0, 50)}...`,
        file 
      })
    } catch (error: any) {
      setUploadTest({ 
        status: 'error', 
        message: `Upload failed: ${error.message}`,
        file 
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      testImageUpload(file)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Image Upload Diagnostics</CardTitle>
          <CardDescription>
            Test and debug image upload functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              'Run Diagnostics'
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Diagnostic Results:</h3>
              {results.map((result, index) => (
                <Alert key={index} variant={result.success ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <AlertDescription>{result.message}</AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Test</CardTitle>
          <CardDescription>
            Test uploading a real image file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploadTest.status === 'uploading'}
              className="hidden"
              id="debug-upload"
            />
            <label
              htmlFor="debug-upload"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 disabled:opacity-50"
            >
              {uploadTest.status === 'uploading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploadTest.status === 'uploading' ? 'Uploading...' : 'Select Test Image'}
            </label>
          </div>

          {uploadTest.message && (
            <Alert variant={
              uploadTest.status === 'success' ? "default" : 
              uploadTest.status === 'error' ? "destructive" : 
              "default"
            }>
              <div className="flex items-center gap-2">
                {uploadTest.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {uploadTest.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                {uploadTest.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                <AlertDescription>{uploadTest.message}</AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

