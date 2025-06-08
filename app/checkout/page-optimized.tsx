"use client"

import React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import AuthLoading from "@/components/auth-loading"
import CheckoutContent from "./checkout-content"

export default function CheckoutPageOptimized() {
  const { state } = useCart()
  const { user, isInitialized } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated after initialization
  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/auth/login")
    }
  }, [isInitialized, user, router])

  // Redirect to cart if no items
  useEffect(() => {
    if (isInitialized && state.items.length === 0) {
      router.push("/cart")
    }
  }, [isInitialized, state.items.length, router])

  // Show loading while auth is being initialized
  if (!isInitialized) {
    return <AuthLoading />
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  // Don't render if no items in cart (will redirect)
  if (state.items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-8">Checkout</h1>
          <CheckoutContent />
        </div>
      </main>

      <Footer />
    </div>
  )
}
