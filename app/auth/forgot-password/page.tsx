"use client"
// Component memoized for performance (5.17KB)
import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsSubmitted(true)
    } catch (error) {
      console.error("Password reset error:", error)
      setError("Failed to send reset email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <Link href="/" className="inline-block">
              <Image src="/logo.png" alt="Global Saanvika" width={80} height={80} className="mx-auto" />
            </Link>
            <div className="mt-6">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-4 font-serif text-3xl font-bold text-foreground">Check Your Email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>

            <div className="space-y-2">
              <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
                Try Different Email
              </Button>

              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Global Saanvika" width={80} height={80} className="mx-auto" />
          </Link>
          <h2 className="mt-6 font-serif text-3xl font-bold text-foreground">Reset Password</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>

        {/* Reset Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="sr-only">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="pl-10"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-destructive text-sm text-center">{error}</div>}

          <div>
            <Button
              type="submit"
              className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>

          <div className="text-center">
            <Link href="/auth/login" className="text-sm text-gold-500 hover:text-gold-600 font-medium">
              <ArrowLeft className="inline mr-1 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </form>

        {/* Help */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Having trouble? Contact our support team at{" "}
            <a href="mailto:support@globalsaanvika.com" className="text-gold-500 hover:text-gold-600">
              support@globalsaanvika.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

