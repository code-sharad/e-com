"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Eye, Truck, CheckCircle } from "lucide-react"
import AuthLoading from "@/components/auth-loading"
import { FirebaseOrdersService, type Order } from "@/lib/firebase/orders"

export default function OrdersPage() {
  const { user, isInitialized } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isInitialized && !user) {
      router.push("/auth/login")
    }
  }, [isInitialized, user, router])

  useEffect(() => {
    const loadUserOrders = async () => {
      if (!user?.email) return
      
      try {
        const userOrders = await FirebaseOrdersService.getOrdersByCustomer(user.email)
        setOrders(userOrders)
      } catch (error) {
        console.error("Error loading orders:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.email) {
      loadUserOrders()
    }
  }, [user])

  if (!isInitialized) {
    return <AuthLoading />
  }

  if (!user) {
    return null
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      processing: { label: "Processing", variant: "secondary" as const, icon: Package },
      shipped: { label: "Shipped", variant: "default" as const, icon: Truck },
      delivered: { label: "Delivered", variant: "default" as const, icon: CheckCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-8 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-8">My Orders</h1>

          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-card rounded-lg p-6 shadow-sm animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-card rounded-lg p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Order #{order.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        Placed on {order.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                      {getStatusBadge(order.status)}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                <div className="border-t border-gold-200/20 pt-4">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-foreground">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gold-200/20">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-gold-500">₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
              <Button onClick={() => router.push("/category/jewelry")}>Start Shopping</Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
