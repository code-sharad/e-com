"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Eye, Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { FirebaseOrdersService, type Order } from "@/lib/firebase/orders"

export default function AdminOrdersPage() {
  const { user, isInitialized } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (!user?.isAdmin) {
      router.push("/")
      return
    }

    let unsubscribe: (() => void) | null = null

    const loadOrders = async () => {
      try {
        setIsLoading(true)
        
        // Set up real-time listener for orders
        unsubscribe = FirebaseOrdersService.subscribeToOrders((updatedOrders) => {
          setOrders(updatedOrders)
          setIsLoading(false)
        })
      } catch (error) {
        console.error("Error loading orders:", error)
        setIsLoading(false)
      }
    }

    loadOrders()

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user, isInitialized, router])

  // Show loading while auth is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect if not admin
  if (!user?.isAdmin) {
    return null
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await FirebaseOrdersService.updateOrderStatus(orderId, newStatus)
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-gold-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gold-500 hover:text-gold-600">
                ← Back to Dashboard
              </Link>
              <h1 className="font-serif text-2xl font-bold text-foreground">Orders Management</h1>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Order Management</h2>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by order ID, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-lg shadow-sm border border-gold-200/20 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "No orders have been placed yet"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {order.id || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-foreground">{order.customerName}</div>
                          <div className="text-muted-foreground">{order.customerEmail}</div>
                          {order.customerPhone && (
                            <div className="text-muted-foreground">{order.customerPhone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-foreground">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-muted-foreground">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index}>
                                {item.productName} × {item.quantity}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-xs">+{order.items.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {formatCurrency(order.total)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.paymentMethod.toUpperCase()} - {order.paymentStatus}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View Details"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={order.status}
                            onValueChange={(value) => order.id && handleStatusUpdate(order.id, value as Order['status'])}
                          >
                            <SelectTrigger className="h-8 w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Order Dialog */}
        {selectedOrder && (
          <Dialog open={isViewDialogOpen} onOpenChange={(open) => { 
            setIsViewDialogOpen(open)
            if (!open) setSelectedOrder(null) 
          }}>
            <DialogContent className="max-w-3xl p-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-foreground">
                  Order Details - {selectedOrder.id}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-foreground mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Name:</span>
                    <div className="text-sm text-foreground">{selectedOrder.customerName}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                    <div className="text-sm text-foreground">{selectedOrder.customerEmail}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                    <div className="text-sm text-foreground">{selectedOrder.customerPhone || "N/A"}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Address:</span>
                    <div className="text-sm text-foreground">
                      {selectedOrder.customerAddress ? 
                        `${selectedOrder.customerAddress.street}, ${selectedOrder.customerAddress.city}, ${selectedOrder.customerAddress.state} ${selectedOrder.customerAddress.pincode}` 
                        : "N/A"
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Order Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Order ID:</span>
                    <div className="text-sm text-foreground">{selectedOrder.id}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <Badge className={`${getStatusColor(selectedOrder.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Total:</span>
                    <div className="text-sm font-semibold text-foreground">
                      {formatCurrency(selectedOrder.total)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Payment Method:</span>
                    <div className="text-sm text-foreground">{selectedOrder.paymentMethod}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Payment Status:</span>
                    <div className="text-sm text-foreground">{selectedOrder.paymentStatus}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Order Date:</span>
                    <div className="text-sm text-foreground">
                      {formatDate(selectedOrder.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">Items Ordered</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {item.productName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {item.productId}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
