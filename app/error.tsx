"use client"

import React from 'react'
import Link from 'next/link'

interface ErrorProps {
  statusCode?: number
  hasGetInitialProps?: boolean
  err?: Error & { statusCode?: number }
}

function Error({ statusCode, hasGetInitialProps, err }: ErrorProps) {
  const renderError = () => {
    if (statusCode === 404) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go Home
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-foreground mb-4">{statusCode || 'Error'}</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-8">
            {statusCode
              ? `A ${statusCode} error occurred on server`
              : 'An error occurred on client'}
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return renderError()
}

Error.getInitialProps = ({ res, err }: { res?: any; err?: any }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
