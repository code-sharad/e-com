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

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  joinDate: Date
  lastPurchase?: Date
  totalOrders: number
  totalSpent: number
  status: "active" | "inactive" | "blocked"
}

function AdminCustomersContent() {  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerDetails, setShowCustomerDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Loading customers...')
      const data = await CustomerService.getAllCustomers()
      console.log('Loaded customers:', data.length)
      setCustomers(data)
    } catch (error) {
      console.error("Error loading customers:", error)
      setError("Failed to load customers. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="container mx-auto px-4 py-8">      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">Manage your customer base</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button 
            onClick={loadCustomers} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div className="md:col-span-6 lg:col-span-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search customers..."
              className="pl-10 bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-4 lg:col-span-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-foreground hover:bg-muted/50">All Customers</SelectItem>
              <SelectItem value="active" className="text-foreground hover:bg-muted/50">Active</SelectItem>
              <SelectItem value="inactive" className="text-foreground hover:bg-muted/50">Inactive</SelectItem>
              <SelectItem value="blocked" className="text-foreground hover:bg-muted/50">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold text-foreground">{customers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-gold-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <p className="text-2xl font-bold text-foreground">
                {customers.filter(c => c.status === "active").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inactive Customers</p>
              <p className="text-2xl font-bold text-foreground">
                {customers.filter(c => c.status === "inactive").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Blocked Customers</p>
              <p className="text-2xl font-bold text-foreground">
                {customers.filter(c => c.status === "blocked").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
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
                <th className="text-left p-4 font-medium text-muted-foreground">Join Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Orders</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Total Spent</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
                    </div>
                  </td>
                </tr>              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
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
                          <div className="font-medium text-foreground">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusColor(customer.status)} text-xs`}>
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-4 text-foreground">
                      {format(customer.joinDate, "MMM d, yyyy")}
                    </td>
                    <td className="p-4 text-foreground">{customer.totalOrders}</td>
                    <td className="p-4 text-foreground">₹{customer.totalSpent.toLocaleString()}</td>
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
        <DialogContent className="bg-card text-foreground border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-gold-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{selectedCustomer.name}</h3>
                  <Badge className={getStatusColor(selectedCustomer.status)}>
                    {selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contact Information</label>
                    <div className="mt-1 space-y-2 text-foreground">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                      {selectedCustomer.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedCustomer.phone}</span>
                        </div>
                      )}
                      {selectedCustomer.address && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedCustomer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Account Details</label>
                    <div className="mt-1 space-y-2 text-foreground">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Joined {format(selectedCustomer.joinDate, "MMMM d, yyyy")}</span>
                      </div>
                      {selectedCustomer.lastPurchase && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Last purchase on {format(selectedCustomer.lastPurchase, "MMMM d, yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purchase History</label>
                    <div className="mt-1 space-y-2">
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                            <p className="text-2xl font-bold text-foreground">{selectedCustomer.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                            <p className="text-2xl font-bold text-foreground">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1" variant="outline">View Orders</Button>
                    <Button className="flex-1" variant="outline">Send Email</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Force dynamic rendering for admin pages that require authentication
export const dynamic = 'force-dynamic'

export default function AdminCustomersPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminCustomersContent />
    </ProtectedRoute>
  )
}
