"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomerService } from "@/lib/services/customer-service"
import { Users, TrendingUp, DollarSign, Activity, CheckCircle, XCircle, Minus } from "lucide-react"

interface CustomerStatsProps {
  isRealTime?: boolean
}

export function CustomerStats({ isRealTime = true }: CustomerStatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    blocked: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    newCustomersToday: 0,
    newCustomersThisWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    if (isRealTime) {
      console.log('CustomerStats: Setting up real-time stats listener...')
      unsubscribe = CustomerService.subscribeToCustomerStats((newStats) => {
        console.log('CustomerStats: Received real-time stats update:', newStats)
        setStats(newStats)
        setLastUpdated(new Date())
        setLoading(false)
      })
    } else {
      // Load stats once
      loadStats()
    }

    return () => {
      if (unsubscribe) {
        console.log('CustomerStats: Cleaning up stats listener')
        unsubscribe()
      }
    }
  }, [isRealTime])

  const loadStats = async () => {
    try {
      setLoading(true)
      const customers = await CustomerService.getAllCustomers()
      
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const newStats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        inactive: customers.filter(c => c.status === 'inactive').length,
        blocked: customers.filter(c => c.status === 'blocked').length,
        totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
        averageOrderValue: 0,
        newCustomersToday: customers.filter(c => c.joinDate >= startOfDay).length,
        newCustomersThisWeek: customers.filter(c => c.joinDate >= startOfWeek).length
      }
      
      const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)
      newStats.averageOrderValue = totalOrders > 0 ? newStats.totalRevenue / totalOrders : 0
      
      setStats(newStats)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('CustomerStats: Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const getGrowthIndicator = (current: number, comparison: number) => {
    if (comparison === 0) return null
    const growth = ((current - comparison) / comparison) * 100
    return growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>All registered customers</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>From all customers</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.averageOrderValue)}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Per order average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Today</p>
                <p className="text-xl font-bold">{stats.newCustomersToday}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Today
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Week</p>
                <p className="text-xl font-bold">{stats.newCustomersThisWeek}</p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                7 Days
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-xl font-bold text-yellow-600">{stats.inactive}</p>
              </div>
              <Minus className="h-5 w-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-xl font-bold text-red-600">{stats.blocked}</p>
              </div>
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Status */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span>{isRealTime ? 'Real-time updates enabled' : 'Static data'}</span>
        </div>        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
      </div>
    </div>  )
}
