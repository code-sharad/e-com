"use client"

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-foreground mb-4">500</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Something went wrong!</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            <div className="space-x-4">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Try Again
              </button>
              <Link 
                href="/" 
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
