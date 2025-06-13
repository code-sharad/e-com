"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerService } from "@/lib/services/customer-service"
import { FirebaseOrdersService } from "@/lib/firebase/orders"
import { FirebaseUsersService } from "@/lib/firebase/users"
import { RefreshCw, Settings, Users, ShoppingCart, Mail } from "lucide-react"
import { testCustomerService } from "@/lib/test-customer-service"

export function CustomerDataDebug() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [customerData, setCustomerData] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any>(null)

  const fetchCustomerByEmail = async () => {
    if (!email) return
    
    setLoading(true)
    setError(null)
    
    try {
      const customer = await CustomerService.getCustomerByEmail(email)
      setCustomerData(customer)
    } catch (err) {
      setError('Failed to fetch customer data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [users, orders, customers] = await Promise.all([
        FirebaseUsersService.getUsers(),
        FirebaseOrdersService.getOrders(),
        CustomerService.getAllCustomers()
      ])
      
      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        uniqueCustomerEmails: new Set([
          ...users.map(u => u.email),
          ...orders.map(o => o.customerEmail)
        ]).size
      })
    } catch (err) {
      setError('Failed to fetch stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const syncAllData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await CustomerService.syncAllCustomerData()
      alert('Customer data sync completed!')
    } catch (err) {
      setError('Failed to sync customer data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const runTests = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const results = await testCustomerService()
      setTestResults(results)
    } catch (err) {
      setError('Failed to run tests')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customer Data Debug Panel
          </CardTitle>
          <CardDescription>
            Test comprehensive customer data fetching from orders and user profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fetch Customer by Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Customer Lookup</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter customer email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={fetchCustomerByEmail} disabled={loading || !email}>
                <Mail className="h-4 w-4 mr-2" />
                Fetch Customer
              </Button>
            </div>
          </div>

          {/* Database Stats */}
          <div className="flex gap-2">
            <Button onClick={fetchStats} disabled={loading} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Get Database Stats
            </Button>
            <Button onClick={syncAllData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync All Customer Data
            </Button>
          </div>

          {/* Run Tests */}
          <div className="flex gap-2">
            <Button onClick={runTests} disabled={loading} variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Run Customer Tests
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Stats Display */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Database Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <div className="text-sm text-muted-foreground">Total Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                    <div className="text-sm text-muted-foreground">Processed Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.uniqueCustomerEmails}</div>
                    <div className="text-sm text-muted-foreground">Unique Emails</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer Data Display */}
          {customerData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Customer Data
                  <Badge variant={customerData.status === 'active' ? 'default' : 'secondary'}>
                    {customerData.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Basic Info</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Name:</strong> {customerData.name}</div>
                        <div><strong>Email:</strong> {customerData.email}</div>
                        <div><strong>Phone:</strong> {customerData.phone || 'Not provided'}</div>
                        <div><strong>Admin:</strong> {customerData.isAdmin ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Statistics</h4>
                      <div className="space-y-1 text-sm">
                        <div><strong>Total Orders:</strong> {customerData.totalOrders}</div>
                        <div><strong>Total Spent:</strong> ₹{customerData.totalSpent.toLocaleString()}</div>
                        <div><strong>Avg Order Value:</strong> ₹{customerData.averageOrderValue.toLocaleString()}</div>
                        <div><strong>Join Date:</strong> {new Date(customerData.joinDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  {customerData.address && (
                    <div>
                      <h4 className="font-medium mb-2">Address</h4>
                      <div className="text-sm">
                        {customerData.address.full || 
                         `${customerData.address.street}, ${customerData.address.city}, ${customerData.address.state} ${customerData.address.pincode}`}
                      </div>
                    </div>
                  )}

                  {customerData.orders && customerData.orders.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recent Orders ({customerData.orders.length})</h4>
                      <div className="space-y-2">
                        {customerData.orders.slice(0, 3).map((order: any) => (
                          <div key={order.id} className="p-2 bg-muted rounded text-sm">
                            <div className="flex justify-between items-center">
                              <span>#{order.orderNumber}</span>
                              <Badge variant="outline">{order.status}</Badge>
                            </div>
                            <div className="text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()} • ₹{order.total.toLocaleString()} • {order.items} items
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Results Display */}
          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {testResults.map((result: any, index: number) => (
                    <div key={index} className={`p-3 rounded-lg text-sm ${result.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <div className="font-medium">{result.name}</div>
                      <div className="flex gap-2">
                        <div>Status: {result.passed ? 'Passed' : 'Failed'}</div>
                        {!result.passed && <div className="text-red-600">Error: {result.error}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {customerData === null && email && !loading && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
              No customer found with email: {email}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
