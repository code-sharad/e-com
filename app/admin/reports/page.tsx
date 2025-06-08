"use client"

import React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, TrendingUp, ShoppingCart, DollarSign, Calendar, Filter } from "lucide-react"
import { FirebaseOrdersService, type Order } from "@/lib/firebase/orders"

interface SalesReportData {
  summary: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    topSellingProducts: Array<{
      productName: string
      quantitySold: number
      revenue: number
    }>
    revenueByCategory: Array<{
      category: string
      revenue: number
      percentage: number
    }>
    monthlyRevenue: Array<{
      month: string
      revenue: number
      orders: number
    }>
  }
  orders: Order[]
  dateRange: {
    from: string
    to: string
  }
}

function AdminReportsContent() {
  const [reportData, setReportData] = useState<SalesReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  })
  const [isExporting, setIsExporting] = useState(false)

  const generateReportData = useCallback(async (fromDate?: string, toDate?: string): Promise<SalesReportData> => {
    try {
      // Get orders from Firebase
      const allOrders = await FirebaseOrdersService.getOrders()
      
      // Filter orders by date range if provided
      let filteredOrders = allOrders
      if (fromDate || toDate) {
        filteredOrders = allOrders.filter(order => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
          const matchesFrom = !fromDate || orderDate >= fromDate
          const matchesTo = !toDate || orderDate <= toDate
          return matchesFrom && matchesTo
        })
      }

      // Calculate summary statistics
      const totalRevenue = filteredOrders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0)
      
      const totalOrders = filteredOrders.length
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      // Calculate top selling products
      const productStats = new Map<string, { name: string; quantity: number; revenue: number }>()
      
      filteredOrders
        .filter(order => order.status === 'delivered')
        .forEach(order => {
          order.items.forEach(item => {
            const existing = productStats.get(item.productId) || { 
              name: item.productName, 
              quantity: 0, 
              revenue: 0 
            }
            existing.quantity += item.quantity
            existing.revenue += item.price * item.quantity
            productStats.set(item.productId, existing)
          })
        })

      const topSellingProducts = Array.from(productStats.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)
        .map(product => ({
          productName: product.name,
          quantitySold: product.quantity,
          revenue: product.revenue
        }))

      // Calculate monthly revenue (last 6 months)
      const monthlyData = new Map<string, { revenue: number; orders: number }>()
      const now = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        monthlyData.set(monthKey, { revenue: 0, orders: 0 })
      }

      filteredOrders
        .filter(order => order.status === 'delivered')
        .forEach(order => {
          const orderDate = new Date(order.createdAt)
          const monthKey = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          const existing = monthlyData.get(monthKey)
          if (existing) {
            existing.revenue += order.total
            existing.orders += 1
          }
        })

      const monthlyRevenue = Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        orders: data.orders
      }))

      return {
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          topSellingProducts,
          revenueByCategory: [], // Would need product categories
          monthlyRevenue
        },
        orders: filteredOrders,
        dateRange: {
          from: fromDate || '',
          to: toDate || ''
        }
      }
    } catch (error) {
      console.error('Error generating report data:', error)
      throw error
    }
  }, [])

  const loadReportData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await generateReportData(dateRange.from, dateRange.to)
      setReportData(data)
    } catch (error) {
      console.error("Error loading report data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [dateRange.from, dateRange.to, generateReportData])

  useEffect(() => {
    loadReportData()
  }, [loadReportData])

  const handleDateRangeChange = () => {
    loadReportData()
  }

  const handleExportCSV = async () => {
    if (!reportData) return

    setIsExporting(true)
    try {
      // Create CSV content
      const csvHeaders = ['Order ID', 'Customer Name', 'Customer Email', 'Items', 'Total', 'Status', 'Payment Method', 'Date']
      const csvRows = reportData.orders.map(order => [
        order.id,
        order.customerName,
        order.customerEmail,
        order.items.map(item => `${item.productName} (${item.quantity})`).join('; '),
        order.total.toString(),
        order.status,
        order.paymentMethod,
        new Date(order.createdAt).toLocaleDateString()
      ])

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert("CSV report downloaded successfully!")
    } catch (error) {
      console.error("Error exporting CSV:", error)
      alert("Failed to export CSV. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = async () => {
    if (!reportData) return

    setIsExporting(true)
    try {
      // Create a new window with the report content
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Popup blocked - please allow popups for this site')
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sales Report - Saanvika</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .text-right { text-align: right; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sales Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            ${reportData.dateRange.from ? `<p>Period: ${reportData.dateRange.from} to ${reportData.dateRange.to || 'Present'}</p>` : ''}
          </div>
          
          <div class="summary">
            <div class="summary-card">
              <h3>Total Revenue</h3>
              <p>₹${reportData.summary.totalRevenue.toLocaleString()}</p>
            </div>
            <div class="summary-card">
              <h3>Total Orders</h3>
              <p>${reportData.summary.totalOrders}</p>
            </div>
            <div class="summary-card">
              <h3>Average Order Value</h3>
              <p>₹${Math.round(reportData.summary.averageOrderValue).toLocaleString()}</p>
            </div>
            <div class="summary-card">
              <h3>Top Product</h3>
              <p>${reportData.summary.topSellingProducts[0]?.productName || 'N/A'}</p>
            </div>
          </div>

          <h2>Recent Orders</h2>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th class="text-right">Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.orders.slice(0, 20).map(order => `
                <tr>
                  <td>${order.id}</td>
                  <td>${order.customerName}<br><small>${order.customerEmail}</small></td>
                  <td>${order.items.map(item => `${item.productName} (${item.quantity})`).join('<br>')}</td>
                  <td class="text-right">₹${order.total.toLocaleString()}</td>
                  <td>${order.status}</td>
                  <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()">Print Report</button>
            <button onclick="window.close()">Close</button>
          </div>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      
      alert("PDF report opened in new window!")
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Failed to export PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { variant: "default" as const, className: "bg-green-100 text-green-800" },
      shipped: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      processing: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      pending: { variant: "secondary" as const, className: "bg-gray-100 text-gray-800" },
      cancelled: { variant: "destructive" as const, className: "" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load report data</p>
          <Button onClick={loadReportData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-gold-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gold-500 hover:text-gold-600">
                ← Back to Dashboard
              </Link>
              <h1 className="font-serif text-2xl font-bold text-foreground">Sales Reports</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleExportCSV}
                disabled={isExporting}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="bg-gold-500 hover:bg-gold-600 text-black flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filter Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">From Date</label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">To Date</label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleDateRangeChange} variant="outline">
                  Apply Filter
                </Button>
                <Button
                  onClick={() => {
                    setDateRange({ from: "", to: "" })
                    setTimeout(loadReportData, 100)
                  }}
                  variant="ghost"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{reportData.summary.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {reportData.dateRange.from ? "For selected period" : "All time"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Orders processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{Math.round(reportData.summary.averageOrderValue).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Per order average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.summary.monthlyRevenue[reportData.summary.monthlyRevenue.length - 1]?.orders || 0}
              </div>
              <p className="text-xs text-muted-foreground">Orders this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.summary.topSellingProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.productName}</p>
                      <p className="text-xs text-muted-foreground">{product.quantitySold} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Sales breakdown by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.summary.revenueByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{category.category}</p>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div
                          className="bg-gold-500 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium">₹{category.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Order ID</th>
                    <th className="text-left py-2 px-4 font-medium">Customer</th>
                    <th className="text-left py-2 px-4 font-medium">Items</th>
                    <th className="text-right py-2 px-4 font-medium">Total</th>
                    <th className="text-left py-2 px-4 font-medium">Status</th>
                    <th className="text-left py-2 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-mono text-sm">{order.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-sm">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {order.items.map((item, idx) => (
                            <div key={idx}>
                              {item.productName} ({item.quantity})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium">₹{order.total.toLocaleString()}</td>
                      <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function AdminReportsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminReportsContent />
    </ProtectedRoute>
  )
}
