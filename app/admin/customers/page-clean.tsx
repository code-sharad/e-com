"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, User, Mail, Calendar, MapPin, Phone, CheckCircle, AlertCircle, Eye, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { CustomerService } from "@/lib/services/customer-service"
import { CustomerDataDebug } from "@/components/admin/customer-data-debug"
import { CustomerStats } from "@/components/admin/customer-stats"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    full?: string
  }
  joinDate: Date
  lastPurchase?: Date
  lastLoginAt?: Date
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  status: "active" | "inactive" | "blocked"
  isAdmin?: boolean
  preferences?: {
    newsletter?: boolean
    notifications?: boolean
  }
  orders?: Array<{
    id: string
    orderNumber: string
    date: Date
    total: number
    status: string
    items: number
  }>
}

function AdminCustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    
    if (isRealTimeEnabled) {
      console.log('Setting up real-time customer updates...')
      setIsLoading(true)
      setError(null)
      
      unsubscribe = CustomerService.subscribeToCustomers((customersData) => {
        console.log('Received real-time customer update:', customersData.length, 'customers')
        setCustomers(customersData)
        setLastUpdated(new Date())
        setIsLoading(false)
        setError(null)
      })
    } else {
      loadCustomers()
    }
    
    return () => {
      if (unsubscribe) {
        console.log('Cleaning up real-time customer listener')
        unsubscribe()
      }
    }
  }, [isRealTimeEnabled])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Loading customers manually...')
      const data = await CustomerService.getAllCustomers()
      console.log('Loaded customers:', data.length)
      setCustomers(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading customers:", error)
      setError("Failed to load customers. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRealTime = () => {
    setIsRealTimeEnabled(!isRealTimeEnabled)
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchQuery))
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-600 border-green-600/20"
      case "inactive":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-600/20"
      case "blocked":
        return "bg-red-500/10 text-red-600 border-red-600/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-600/20"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Debug Panel */}
      <div className="mb-8">
        <CustomerDataDebug />
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer base</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="flex items-center gap-2 mr-2">
            <div className={`w-2 h-2 rounded-full ${isRealTimeEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-muted-foreground">
              {isRealTimeEnabled ? 'Live' : 'Static'}
            </span>
          </div>
          <Button 
            onClick={toggleRealTime} 
            variant={isRealTimeEnabled ? "default" : "outline"} 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRealTimeEnabled ? 'animate-spin' : ''}`} />
            {isRealTimeEnabled ? 'Live Updates' : 'Enable Live'}
          </Button>
          <Button 
            onClick={loadCustomers} 
            variant="outline" 
            size="sm"
            disabled={isLoading || isRealTimeEnabled}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {lastUpdated && (
            <span className="text-xs text-muted-foreground ml-2">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-4 lg:col-span-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="pl-10 bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-3 lg:col-span-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3 lg:col-span-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="mb-8">
        <CustomerStats isRealTime={isRealTimeEnabled} />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <Button 
              onClick={loadCustomers} 
              variant="outline" 
              size="sm" 
              className="ml-auto"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Customers Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-muted-foreground">Customer</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Join Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Orders</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Total Spent</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {customers.length === 0 ? "No customers yet" : "No customers match your filters"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {customers.length === 0 
                          ? "Customers will appear here once they start placing orders."
                          : "Try adjusting your search or filter criteria."
                        }
                      </p>
                      {customers.length === 0 && (
                        <Button onClick={loadCustomers} variant="outline">
                          Refresh
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gold-500/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-gold-500" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground flex items-center gap-2">
                            {customer.name || 'Unknown'}
                            {customer.isAdmin && (
                              <Badge variant="secondary" className="text-xs">Admin</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{customer.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(customer.status)} text-xs`}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {customer.phone && (
                          <div className="flex items-center text-foreground mb-1">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            {customer.phone}
                          </div>
                        )}
                        {customer.address?.city && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {customer.address.city}
                            {customer.address.state && `, ${customer.address.state}`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-foreground">
                      {customer.joinDate ? format(customer.joinDate, "MMM d, yyyy") : 'Unknown'}
                    </td>
                    <td className="p-4 text-foreground">{customer.totalOrders || 0}</td>
                    <td className="p-4 text-foreground">₹{(customer.totalSpent || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-muted"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setShowCustomerDetails(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
        <DialogContent className="bg-card text-foreground border-border max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 pb-6 border-b border-border">
                <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-gold-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-foreground">{selectedCustomer.name || 'Unknown'}</h3>
                    {selectedCustomer.isAdmin && (
                      <Badge variant="destructive" className="text-xs">Admin User</Badge>
                    )}
                    <Badge className={getStatusColor(selectedCustomer.status)}>
                      {selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      {selectedCustomer.email}
                    </div>
                    {selectedCustomer.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        {selectedCustomer.phone}
                      </div>
                    )}
                    {selectedCustomer.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                        <span>{selectedCustomer.address.full || 'Address not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Order Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div>Total Orders: <span className="font-medium">{selectedCustomer.totalOrders}</span></div>
                    <div>Total Spent: <span className="font-medium">₹{selectedCustomer.totalSpent.toLocaleString()}</span></div>
                    <div>Average Order: <span className="font-medium">₹{selectedCustomer.averageOrderValue.toLocaleString()}</span></div>
                    <div>Join Date: <span className="font-medium">{format(selectedCustomer.joinDate, "MMM d, yyyy")}</span></div>
                    {selectedCustomer.lastPurchase && (
                      <div>Last Purchase: <span className="font-medium">{format(selectedCustomer.lastPurchase, "MMM d, yyyy")}</span></div>
                    )}
                  </div>
                </div>
              </div>

              {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Recent Orders</h4>
                  <div className="space-y-2">
                    {selectedCustomer.orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="p-3 bg-muted rounded-lg text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">#{order.orderNumber}</span>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                        <div className="text-muted-foreground">
                          {format(order.date, "MMM d, yyyy")} • ₹{order.total.toLocaleString()} • {order.items} items
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminCustomersPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminCustomersContent />
    </ProtectedRoute>
  )
}
