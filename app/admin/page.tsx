"use client"
// Component memoized for performance (24.97KB)
import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Users, ShoppingCart, TrendingUp, Plus, BarChart3, Activity, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardService, type DashboardStats, type RecentActivity } from "@/lib/services/dashboard-service"

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        
        // Load initial stats
        const initialStats = await DashboardService.getDashboardStats()
        setStats(initialStats)
        
        // Load recent activity
        const activity = await DashboardService.getRecentActivity()
        setRecentActivity(activity)
        
        // Set up real-time updates
        unsubscribe = await DashboardService.subscribeToRealtimeStats((updatedStats) => {
          setStats(prevStats => prevStats ? { ...prevStats, ...updatedStats } : updatedStats as DashboardStats)
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "product":
        return <Package className="h-4 w-4" />
      case "user":
        return <Users className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600"
      case "processing":
        return "text-blue-600"
      case "shipped":
        return "text-purple-600"
      case "delivered":
        return "text-green-600"
      case "cancelled":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Enhanced Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-gold-200/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <Link href="/" className="group flex items-center space-x-2 text-gold-500 hover:text-gold-600 transition-colors">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to Store</span>
              </Link>
              <div className="h-8 w-px bg-border"></div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your jewelry collection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Dashboard</span>
              </div>
              <Link href="/admin/products/new">
                <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black shadow-lg hover:shadow-xl transition-all duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center py-8">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
            Welcome back, Admin
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor your jewelry business performance, manage products, and track orders all in one place.
          </p>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-gradient-to-br from-card via-card to-card/80 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gold-200/20 hover:border-gold-300/40">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Products</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalProducts || 0}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="font-medium">{stats?.productsChange || "0%"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{stats?.activeProducts || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-card via-card to-card/80 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gold-200/20 hover:border-gold-300/40">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalOrders || 0}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="font-medium">{stats?.ordersChange || "0%"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{stats?.pendingOrders || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-card via-card to-card/80 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gold-200/20 hover:border-gold-300/40">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Revenue</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats ? formatCurrency(stats.totalRevenue) : "₹0"}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="font-medium">{stats?.revenueChange || "0%"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-gold-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-gold-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">₹</span>
                </div>
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-card via-card to-card/80 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gold-200/20 hover:border-gold-300/40">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Customers</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalCustomers || 0}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="font-medium">{stats?.customersChange || "0%"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">from last month</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">+</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 dark:from-yellow-950/50 dark:to-yellow-900/30 rounded-xl p-6 border border-yellow-200/50 dark:border-yellow-800/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats?.pendingOrders || 0}</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 rounded-xl p-6 border border-green-200/50 dark:border-green-800/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Active Products</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats?.activeProducts || 0}</p>
                <p className="text-xs text-green-700 dark:text-green-300">Ready for sale</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 rounded-xl p-6 border border-red-200/50 dark:border-red-800/30">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Out of Stock</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats?.outOfStockProducts || 0}</p>
                <p className="text-xs text-red-700 dark:text-red-300">Needs restocking</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Quick Actions */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">Quick Actions</h2>
              <div className="h-px bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 flex-1 ml-4"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/admin/products">
                <div className="group bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gold-200/30 hover:border-gold-400/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-gold-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-gold-600 transition-colors">
                          Manage Products
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Add, edit, or remove products from your jewelry catalog. Manage inventory and pricing.
                        </p>
                        <div className="mt-4 flex items-center text-sm text-gold-600 group-hover:text-gold-700">
                          <span className="font-medium">View Products</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/orders">
                <div className="group bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gold-200/30 hover:border-gold-400/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-green-600 transition-colors">
                          Manage Orders
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Process and track customer orders, update order status, and manage shipping details.
                        </p>
                        <div className="mt-4 flex items-center text-sm text-green-600 group-hover:text-green-700">
                          <span className="font-medium">View Orders</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/customers">
                <div className="group bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gold-200/30 hover:border-gold-400/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-blue-600 transition-colors">
                          Manage Customers
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          View customer profiles, track purchase history, and manage customer relationships.
                        </p>
                        <div className="mt-4 flex items-center text-sm text-blue-600 group-hover:text-blue-700">
                          <span className="font-medium">View Customers</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/reports">
                <div className="group bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gold-200/30 hover:border-gold-400/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-purple-600 transition-colors">
                          Sales Reports & Analytics
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          View detailed sales analytics, track performance metrics, and generate comprehensive business reports to make data-driven decisions.
                        </p>
                        <div className="mt-4 flex items-center text-sm text-purple-600 group-hover:text-purple-700">
                          <span className="font-medium">View Reports</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/admin/data-extraction">
                <div className="group bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gold-200/30 hover:border-gold-400/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex items-start space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-teal-600 transition-colors">
                          Data Extraction
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Extract detailed order and customer profile information for analysis, export data in CSV/JSON formats.
                        </p>
                        <div className="mt-4 flex items-center text-sm text-teal-600 group-hover:text-teal-700">
                          <span className="font-medium">Extract Data</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Enhanced Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold text-foreground">Recent Activity</h2>
              <Activity className="h-5 w-5 text-gold-500" />
            </div>
            <div className="bg-gradient-to-br from-card via-card/95 to-card/90 rounded-xl shadow-lg border border-gold-200/30 overflow-hidden">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {recentActivity.map((activity, index) => (
                    <div key={activity.id} className="p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-600/20 flex items-center justify-center">
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-foreground text-sm leading-5 truncate">
                                {activity.title}
                              </p>
                              <p className="text-muted-foreground text-sm mt-1 leading-5">
                                {activity.description}
                              </p>
                            </div>
                            {activity.status && (
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-3 ${
                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                activity.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                activity.status === 'shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                activity.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                activity.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                              }`}>
                                {activity.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-3">
                            <div className="w-2 h-2 bg-gold-400 rounded-full"></div>
                            <p className="text-xs text-muted-foreground">
                              {activity.timestamp.toLocaleDateString('en-IN', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-muted/20 text-center">
                    <Link href="/admin/orders" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
                      View all activity →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground mb-2">No recent activity</h3>
                  <p className="text-sm text-muted-foreground">
                    Recent orders and updates will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Force dynamic rendering for admin pages that require authentication
export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}

