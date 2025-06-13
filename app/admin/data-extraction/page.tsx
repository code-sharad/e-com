"use client"

// Force dynamic rendering for admin pages that require authentication
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Download, 
  Search, 
  Filter, 
  FileText, 
  Users, 
  ShoppingCart,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  RefreshCw
} from "lucide-react"
import { 
  DataExtractionService, 
  type ExtractedOrderData, 
  type ExtractedCustomerProfile,
  type DataExtractionFilters 
} from "@/lib/services/data-extraction"
import { ProtectedRoute } from "@/components/auth/protected-route"

function DataExtractionPage() {
  const [orders, setOrders] = useState<ExtractedOrderData[]>([])
  const [customers, setCustomers] = useState<ExtractedCustomerProfile[]>([])
  const [selectedOrder, setSelectedOrder] = useState<ExtractedOrderData | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<ExtractedCustomerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<DataExtractionFilters>({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date()
    }
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('DataExtraction Page: Loading data with filters:', filters)
      const [ordersData, customersData, analyticsData] = await Promise.all([
        DataExtractionService.extractOrdersData(filters),
        DataExtractionService.extractAllCustomerProfiles(filters),
        DataExtractionService.generateAnalyticsReport(filters)
      ])
      
      console.log('DataExtraction Page: Loaded', ordersData.length, 'orders and', customersData.length, 'customers')
      setOrders(ordersData)
      setCustomers(customersData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load data. Please check your connection and try again.")    } finally {
      setIsLoading(false)
    }  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExportOrders = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    try {
      if (format === 'csv') {
        const csvData = await DataExtractionService.exportOrdersToCSV(filters)
        downloadFile(csvData, 'orders-export.csv', 'text/csv')
      } else {
        const jsonData = JSON.stringify(orders, null, 2)
        downloadFile(jsonData, 'orders-export.json', 'application/json')
      }
    } catch (error) {
      console.error("Error exporting orders:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCustomers = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    try {
      if (format === 'csv') {
        const csvData = await DataExtractionService.exportCustomersToCSV(filters)
        downloadFile(csvData, 'customers-export.csv', 'text/csv')
      } else {
        const jsonData = JSON.stringify(customers, null, 2)
        downloadFile(jsonData, 'customers-export.json', 'application/json')
      }
    } catch (error) {
      console.error("Error exporting customers:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.customerInfo?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.customerInfo?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.orderNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.orderStatus?.current === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      (customer.personalInfo?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (customer.personalInfo?.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || customer.accountInfo?.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">
            Data Extraction & Analytics
          </h1>
          <p className="text-muted-foreground">
            Extract detailed order and customer profile information for analysis
          </p>
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                </div>                <div className="text-2xl font-bold text-foreground">
                  {analytics.summary?.totalOrders || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">Total Customers</span>
                </div>                <div className="text-2xl font-bold text-foreground">
                  {analytics.summary?.totalCustomers || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-gold-500" />
                  <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                </div>                <div className="text-2xl font-bold text-foreground">
                  ₹{(analytics.summary?.totalRevenue || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-muted-foreground">Avg Order Value</span>
                </div>                <div className="text-2xl font-bold text-foreground">
                  ₹{Math.round(analytics.summary?.averageOrderValue || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders or customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Status Filter
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Date Range
                </label>
                <Input
                  type="date"
                  value={filters.dateRange?.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setFilters({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange!,
                      startDate: new Date(e.target.value)
                    }
                  })}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={loadData} disabled={isLoading} className="w-full">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Loading...' : 'Apply Filters'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders ({filteredOrders.length})
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Customers ({filteredCustomers.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order Details</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleExportOrders('csv')} 
                    disabled={isExporting}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={() => handleExportOrders('json')} 
                    disabled={isExporting}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Order #</th>
                        <th className="text-left py-3 px-4 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 font-medium">Items</th>
                        <th className="text-left py-3 px-4 font-medium">Total</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm">{order.orderNumber}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{order.customerInfo.name}</p>
                              <p className="text-sm text-muted-foreground">{order.customerInfo.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {order.orderSummary?.itemCount || 0} items
                          </td>
                          <td className="py-3 px-4 font-medium">
                            ₹{(order.orderSummary?.totalAmount || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {order.orderStatus.current}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {order.timestamps?.createdAt?.toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                                </DialogHeader>
                                {selectedOrder && (
                                  <OrderDetailsModal order={selectedOrder} />
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer Profiles</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleExportCustomers('csv')} 
                    disabled={isExporting}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={() => handleExportCustomers('json')} 
                    disabled={isExporting}
                    variant="outline"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Customer</th>
                        <th className="text-left py-3 px-4 font-medium">Orders</th>
                        <th className="text-left py-3 px-4 font-medium">Total Spent</th>
                        <th className="text-left py-3 px-4 font-medium">Avg Order</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Joined</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{customer.personalInfo.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.personalInfo.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{customer.orderHistory?.totalOrders || 0}</td>
                          <td className="py-3 px-4 font-medium">
                            ₹{(customer.orderHistory?.totalSpent || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            ₹{Math.round(customer.orderHistory?.averageOrderValue || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">
                              {customer.accountInfo?.status || 'N/A'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {customer.accountInfo?.joinDate?.toLocaleDateString() || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedCustomer(customer)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Customer Profile - {customer.personalInfo.name}</DialogTitle>
                                </DialogHeader>
                                {selectedCustomer && (
                                  <CustomerProfileModal customer={selectedCustomer} />
                                )}
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {analytics && (
              <div className="space-y-6">
                {/* Top Products */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.productMetrics.topProducts.map((product: any, index: number) => (
                        <div key={product.productId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.quantity} units sold
                            </p>
                          </div>                          <div className="text-right">
                            <p className="font-medium">₹{(product.revenue || 0).toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">#{index + 1}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Customers */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.customerMetrics.topCustomers.map((customer: any, index: number) => (
                        <div key={customer.email} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                          </div>                          <div className="text-right">
                            <p className="font-medium">₹{(customer.totalSpent || 0).toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {customer.totalOrders} orders
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Order Details Modal Component
function OrderDetailsModal({ order }: { order: ExtractedOrderData }) {
  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-foreground">{order.customerInfo.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-foreground">{order.customerInfo.email}</p>
          </div>
          {order.customerInfo.phone && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-foreground">{order.customerInfo.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
        <p className="text-foreground">{order.shippingAddress.fullAddress}</p>
      </div>

      {/* Order Items */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Order Items</h3>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">
                  ₹{item.unitPrice} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">₹{(item.totalPrice || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2">          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{(order.orderSummary?.subtotal || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>₹{(order.orderSummary?.tax || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>₹{(order.orderSummary?.totalAmount || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
          <p className="text-foreground">{order.paymentInfo.method}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
          <Badge variant="outline">{order.paymentInfo.status}</Badge>
        </div>
      </div>
    </div>
  )
}

// Customer Profile Modal Component
function CustomerProfileModal({ customer }: { customer: ExtractedCustomerProfile }) {
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-foreground">{customer.personalInfo.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-foreground">{customer.personalInfo.email}</p>
          </div>
          {customer.personalInfo.phone && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p className="text-foreground">{customer.personalInfo.phone}</p>
            </div>
          )}
          {customer.address.primary && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Address</p>
              <p className="text-foreground">{customer.address.primary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Account Information</h3>
        <div className="grid grid-cols-2 gap-4">          <div>
            <p className="text-sm font-medium text-muted-foreground">Join Date</p>
            <p className="text-foreground">{customer.accountInfo?.joinDate?.toLocaleDateString() || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge variant="outline">{customer.accountInfo?.status || 'N/A'}</Badge>
          </div>
        </div>
      </div>

      {/* Order History Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Order History</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold text-foreground">{customer.orderHistory?.totalOrders || 0}</p>
          </div>          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-foreground">₹{(customer.orderHistory?.totalSpent || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
            <p className="text-2xl font-bold text-foreground">₹{Math.round(customer.orderHistory?.averageOrderValue || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {(customer.orderSummary || []).slice(0, 5).map((order) => (
            <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
              <div>
                <p className="font-medium">{order.orderNumber}</p>                <p className="text-sm text-muted-foreground">
                  {order.timestamps?.createdAt?.toLocaleDateString() || 'N/A'} • {order.orderSummary?.itemCount || 0} items
                </p>
              </div>              <div className="text-right">
                <p className="font-medium">₹{(order.orderSummary?.totalAmount || 0).toLocaleString()}</p>
                <Badge variant="outline" className="text-xs">
                  {order.orderStatus.current}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DataExtractionPageContent() {
  return <DataExtractionPage />
}

export default function AdminDataExtractionPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <DataExtractionPageContent />
    </ProtectedRoute>
  )
}

