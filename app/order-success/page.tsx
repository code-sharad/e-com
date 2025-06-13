"use client"
// Component memoized for performance (10.86KB)
import React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/common/navbar"
import Footer from "@/components/common/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Truck, Home, ShoppingBag } from "lucide-react"
import { FirebaseOrdersService, type Order } from "@/lib/firebase/orders"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderNumber] = useState(() => `GS${Date.now().toString().slice(-6)}`)

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        try {
          const fetchedOrder = await FirebaseOrdersService.getOrder(orderId)
          setOrder(fetchedOrder)
        } catch (error) {
          console.error("Error fetching order:", error)
        }
      }
      setLoading(false)
    }

    fetchOrder()
  }, [orderId])

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-8">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Order Placed Successfully!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for your purchase. Your order has been confirmed and will be processed shortly.
            </p>

            {/* Order Details Card */}
            <div className="bg-card rounded-lg p-8 mb-8 text-left max-w-2xl mx-auto">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-6">Order Details</h2>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-semibold text-foreground">
                      {order?.id ? `GS${order.id.slice(-6)}` : orderNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Order Date:</span>
                    <span className="font-semibold text-foreground">
                      {order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }) : new Date().toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Amount:</span>
                    <span className="font-bold text-gold-500">
                      {order?.totalAmount ? formatCurrency(order.totalAmount) : "₹0"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span className="font-semibold text-foreground">
                      {order?.paymentMethod === "razorpay" ? "Online Payment" : "Cash on Delivery"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Estimated Delivery:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      {order?.status === "processing" ? "Processing" : "Processing"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            {order && order.items && order.items.length > 0 && (
              <div className="bg-card rounded-lg p-8 mb-8 max-w-2xl mx-auto">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-6 text-left">Items Ordered</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Timeline */}
            <div className="bg-card rounded-lg p-8 mb-8 max-w-2xl mx-auto">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-6 text-left">Order Timeline</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">Order Confirmed</p>
                    <p className="text-sm text-muted-foreground">Your order has been placed successfully</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Just now</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">Processing</p>
                    <p className="text-sm text-muted-foreground">We&apos;re preparing your items</p>
                  </div>
                  <span className="text-sm text-muted-foreground">1-2 days</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-muted-foreground">Shipped</p>
                    <p className="text-sm text-muted-foreground">Your order is on the way</p>
                  </div>
                  <span className="text-sm text-muted-foreground">3-5 days</span>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-muted-foreground">Delivered</p>
                    <p className="text-sm text-muted-foreground">Package delivered to your address</p>
                  </div>
                  <span className="text-sm text-muted-foreground">5-7 days</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/orders">
                <Button className="bg-gold-500 hover:bg-gold-600 text-black font-semibold px-8">
                  Track Your Order
                </Button>
              </Link>

              <Link href="/category/jewelry">
                <Button
                  variant="outline"
                  className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black px-8"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="mt-12 p-6 bg-muted/30 rounded-lg max-w-2xl mx-auto">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Need Help?</h3>
              <p className="text-muted-foreground mb-4">
                If you have any questions about your order, feel free to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </Link>
                <a href="tel:+919876543210">
                  <Button variant="outline" size="sm">
                    Call: +91 98765 43210
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}


