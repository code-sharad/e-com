"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/components/auth/auth-provider"
import Navbar from "@/components/common/navbar"
import Footer from "@/components/common/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Calendar,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { FirebaseOrdersService, type Order } from "@/lib/firebase/orders"

export default function OrderDetailContent() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      return // Will be handled by ProtectedRoute
    }    const fetchOrder = async () => {
      setLoading(true)
      try {
        const orderData = await FirebaseOrdersService.getOrder(orderId)
        
        if (!orderData) {
          setError("Order not found")
          setLoading(false)
          return
        }

        // Check if this order belongs to the current user
        if (orderData.customerEmail !== user.email) {
          setError("Access denied - this order doesn't belong to you")
          setLoading(false)
          return
        }

        setOrder(orderData)
      } catch (err) {
        console.error("Error fetching order:", err)
        setError("Failed to load order details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [user, orderId])

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Helper function to format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    
    try {
      // Convert Firestore timestamp to JS Date if needed
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      
      return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date)
    } catch (err) {
      console.error("Error formatting date:", err)
      return 'Invalid date'
    }
  }

  // Get status color and icon
  const getStatusDetails = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="h-4 w-4 mr-1" />,
        text: "Pending"
      },
      processing: {
        color: "bg-blue-100 text-blue-800",
        icon: <Package className="h-4 w-4 mr-1" />,
        text: "Processing"
      },
      shipped: {
        color: "bg-purple-100 text-purple-800",
        icon: <Truck className="h-4 w-4 mr-1" />,
        text: "Shipped"
      },
      delivered: {
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
        text: "Delivered"
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: <AlertCircle className="h-4 w-4 mr-1" />,
        text: "Cancelled"
      }
    }

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  // Get payment status color and text
  const getPaymentStatusDetails = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Payment Pending"
      },
      completed: {
        color: "bg-green-100 text-green-800",
        text: "Paid"
      },
      failed: {
        color: "bg-red-100 text-red-800",
        text: "Payment Failed"
      },
      refunded: {
        color: "bg-gray-100 text-gray-800",
        text: "Refunded"
      }
    }

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              <AlertCircle className="inline-block h-5 w-5 mr-2" />
              {error || "Order not found"}
            </h2>            <p className="text-red-700 mb-4">
              We couldn&apos;t find the order you&apos;re looking for.
            </p>
            <Button variant="outline" asChild>
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const statusDetails = getStatusDetails(order.status)
  const paymentStatusDetails = getPaymentStatusDetails(order.paymentStatus)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Order #{order.id?.slice(-8) || 'N/A'}</h1>
              <p className="text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className={statusDetails.color}>
                <span className="flex items-center">
                  {statusDetails.icon}
                  {statusDetails.text}
                </span>
              </Badge>
              
              <Badge className={paymentStatusDetails.color}>
                <span className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  {paymentStatusDetails.text}
                </span>
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 pb-4 border-b">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">                        {item.image ? (
                          <Image 
                            src={item.image} 
                            alt={item.productName} 
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full text-gray-400">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.productName}</h3>
                        <div className="flex justify-between mt-2">
                          <div className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(Math.round(order.totalAmount / 1.18))}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (GST 18%)</span>
                      <span>{formatCurrency(order.totalAmount - Math.round(order.totalAmount / 1.18))}</span>
                    </div>
                    
                    <div className="flex justify-between pt-4 border-t font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer and Shipping Information */}
          <div className="space-y-6">            <Card>
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm">{order.customerName}</h3>
                    <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                    {order.customerPhone && (
                      <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <CardTitle>Shipping Address</CardTitle>
                </div>
              </CardHeader>              <CardContent>
                <div className="text-sm">
                  <p className="font-medium">{order.customerName}</p>
                  <p>{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                  <p>India</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                  <CardTitle>Payment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Method</span>
                    <span className="text-sm font-medium capitalize">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                    </span>
                  </div>
                    <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={paymentStatusDetails.color + " text-xs"}>
                      {paymentStatusDetails.text}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
