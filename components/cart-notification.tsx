"use client"

import { useEffect } from "react"
import { CheckCircle, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CartNotificationProps {
  show: boolean
  productName: string
  onClose: () => void
}

export default function CartNotification({ show, productName, onClose }: CartNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed top-24 right-4 z-50 bg-card border border-gold-200/20 rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-right">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <CheckCircle className="h-6 w-6 text-green-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Added to cart!</p>
          <p className="text-sm text-muted-foreground">{productName}</p>
          <div className="mt-3 flex space-x-2">
            <Link href="/cart">
              <Button size="sm" className="bg-gold-500 hover:bg-gold-600 text-black">
                <ShoppingCart className="h-3 w-3 mr-1" />
                View Cart
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
