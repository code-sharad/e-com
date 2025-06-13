// Data Extraction Service for Orders and Customer Profiles
import { getFirestore } from '@/lib/firebase'
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { FirebaseOrdersService, type Order } from '@/lib/firebase/orders'
import { CustomerService, type Customer } from '@/lib/services/customer-service'

export interface ExtractedOrderData {
  id: string
  orderNumber: string
  customerInfo: {
    name: string
    email: string
    phone?: string
  }
  shippingAddress: {
    street: string
    city: string
    state: string
    pincode: string
    fullAddress: string
  }
  items: Array<{
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    image?: string
  }>
  orderSummary: {
    subtotal: number
    tax: number
    totalAmount: number
    itemCount: number
  }
  paymentInfo: {
    method: string
    status: string
    transactionId?: string
  }
  orderStatus: {
    current: string
    statusHistory?: Array<{
      status: string
      timestamp: Date
      notes?: string
    }>
  }
  timestamps: {
    createdAt: Date
    updatedAt: Date
    estimatedDelivery?: Date
  }
  notes?: string
}

export interface ExtractedCustomerProfile {
  id: string
  personalInfo: {
    name: string
    email: string
    phone?: string
  }
  address: {
    primary?: string
    shipping?: Array<{
      street: string
      city: string
      state: string
      pincode: string
      isDefault: boolean
    }>
  }
  accountInfo: {
    joinDate: Date
    lastLogin?: Date
    status: 'active' | 'inactive' | 'blocked'
    emailVerified: boolean
  }
  orderHistory: {
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    lastPurchase?: Date
    favoriteCategories: string[]
  }
  preferences: {
    newsletter: boolean
    smsNotifications: boolean
    currency: string
    language: string
  }
  orderSummary: ExtractedOrderData[]
}

export interface DataExtractionFilters {
  dateRange?: {
    startDate: Date
    endDate: Date
  }
  orderStatus?: string[]
  customerStatus?: string[]
  paymentMethod?: string[]
  minOrderValue?: number
  maxOrderValue?: number
  categories?: string[]
}

export class DataExtractionService {
  
  /**
   * Extract detailed order information
   */
  static async extractOrderDetails(orderId: string): Promise<ExtractedOrderData | null> {
    try {
      const order = await FirebaseOrdersService.getOrder(orderId)
      if (!order) return null

      return this.transformOrderToExtractedData(order)
    } catch (error) {
      console.error('Error extracting order details:', error)
      throw error
    }
  }

  /**
   * Extract multiple orders with filters
   */
  static async extractOrdersData(filters?: DataExtractionFilters): Promise<ExtractedOrderData[]> {
    try {
      const orders = await this.getFilteredOrders(filters)
      return orders.map(order => this.transformOrderToExtractedData(order))
    } catch (error) {
      console.error('Error extracting orders data:', error)
      throw error
    }
  }

  /**
   * Extract comprehensive customer profile
   */  static async extractCustomerProfile(customerId?: string, customerEmail?: string): Promise<ExtractedCustomerProfile | null> {
    try {
      console.log('DataExtraction: Extracting customer profile for', customerId || customerEmail)
      let customer: Customer | null = null
      
      if (customerId) {
        customer = await CustomerService.getCustomerById(customerId)
      } else if (customerEmail) {
        const customers = await CustomerService.getAllCustomers()
        customer = customers.find(c => c.email === customerEmail) || null
      }

      if (!customer) {
        console.log('DataExtraction: Customer not found')
        return null
      }

      // Get customer's orders
      const customerOrders = await FirebaseOrdersService.getOrders({
        customerEmail: customer.email
      })

      const extractedOrders = customerOrders.map(order => 
        this.transformOrderToExtractedData(order)
      )

      console.log('DataExtraction: Found', extractedOrders.length, 'orders for customer')

      return this.transformCustomerToExtractedProfile(customer, extractedOrders)
    } catch (error) {
      console.error('Error extracting customer profile:', error)
      return null
    }
  }

  /**
   * Extract all customer profiles with their order details
   */  static async extractAllCustomerProfiles(filters?: DataExtractionFilters): Promise<ExtractedCustomerProfile[]> {
    try {
      console.log('DataExtraction: Extracting all customer profiles...')
      const customers = await CustomerService.getAllCustomers()
      console.log('DataExtraction: Found', customers.length, 'customers')
      const profiles: ExtractedCustomerProfile[] = []

      for (const customer of customers) {
        // Apply customer status filter
        if (filters?.customerStatus && !filters.customerStatus.includes(customer.status)) {
          continue
        }

        try {
          const customerOrders = await FirebaseOrdersService.getOrders({
            customerEmail: customer.email
          })

          // Apply order filters
          const filteredOrders = this.applyOrderFilters(customerOrders, filters)
          const extractedOrders = filteredOrders.map(order => 
            this.transformOrderToExtractedData(order)
          )

          const profile = this.transformCustomerToExtractedProfile(customer, extractedOrders)
          profiles.push(profile)
        } catch (orderError) {
          console.error('Error loading orders for customer', customer.email, orderError)
          // Still add customer profile even if orders fail
          const profile = this.transformCustomerToExtractedProfile(customer, [])
          profiles.push(profile)
        }
      }

      console.log('DataExtraction: Extracted', profiles.length, 'customer profiles')
      return profiles
    } catch (error) {
      console.error('Error extracting all customer profiles:', error)
      return []
    }
  }

  /**
   * Export data to CSV format
   */
  static async exportOrdersToCSV(filters?: DataExtractionFilters): Promise<string> {
    try {
      const orders = await this.extractOrdersData(filters)
      
      const csvHeaders = [
        'Order ID',
        'Order Number', 
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Shipping Address',
        'Items',
        'Item Count',
        'Subtotal',
        'Tax',
        'Total Amount',
        'Payment Method',
        'Payment Status',
        'Order Status',
        'Order Date',
        'Last Updated',
        'Notes'
      ]

      const csvRows = orders.map(order => [
        order.id,
        order.orderNumber,
        order.customerInfo.name,
        order.customerInfo.email,
        order.customerInfo.phone || '',
        order.shippingAddress.fullAddress,
        order.items.map(item => `${item.productName} (${item.quantity})`).join('; '),
        order.orderSummary.itemCount.toString(),
        order.orderSummary.subtotal.toString(),
        order.orderSummary.tax.toString(),
        order.orderSummary.totalAmount.toString(),
        order.paymentInfo.method,
        order.paymentInfo.status,
        order.orderStatus.current,
        order.timestamps.createdAt.toISOString(),
        order.timestamps.updatedAt.toISOString(),
        order.notes || ''
      ])

      return [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
    } catch (error) {
      console.error('Error exporting orders to CSV:', error)
      throw error
    }
  }

  /**
   * Export customer profiles to CSV format
   */
  static async exportCustomersToCSV(filters?: DataExtractionFilters): Promise<string> {
    try {
      const profiles = await this.extractAllCustomerProfiles(filters)
      
      const csvHeaders = [
        'Customer ID',
        'Name',
        'Email',
        'Phone',
        'Address',
        'Join Date',
        'Last Purchase',
        'Account Status',
        'Total Orders',
        'Total Spent',
        'Average Order Value',
        'Favorite Categories',
        'Newsletter Subscribed',
        'Email Verified'
      ]

      const csvRows = profiles.map(profile => [
        profile.id,
        profile.personalInfo.name,
        profile.personalInfo.email,
        profile.personalInfo.phone || '',
        profile.address.primary || '',
        profile.accountInfo.joinDate.toISOString(),
        profile.orderHistory.lastPurchase?.toISOString() || '',
        profile.accountInfo.status,
        profile.orderHistory.totalOrders.toString(),
        profile.orderHistory.totalSpent.toString(),
        profile.orderHistory.averageOrderValue.toString(),
        profile.orderHistory.favoriteCategories.join('; '),
        profile.preferences.newsletter.toString(),
        profile.accountInfo.emailVerified.toString()
      ])

      return [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')
    } catch (error) {
      console.error('Error exporting customers to CSV:', error)
      throw error
    }
  }

  /**
   * Generate detailed analytics report
   */
  static async generateAnalyticsReport(filters?: DataExtractionFilters) {
    try {
      const orders = await this.extractOrdersData(filters)
      const profiles = await this.extractAllCustomerProfiles(filters)

      const analytics = {
        summary: {
          totalOrders: orders.length,
          totalCustomers: profiles.length,
          totalRevenue: orders.reduce((sum, order) => sum + order.orderSummary.totalAmount, 0),
          averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.orderSummary.totalAmount, 0) / orders.length : 0
        },
        orderMetrics: {
          byStatus: this.groupBy(orders, order => order.orderStatus.current),
          byPaymentMethod: this.groupBy(orders, order => order.paymentInfo.method),
          byMonth: this.groupOrdersByMonth(orders)
        },
        customerMetrics: {
          byStatus: this.groupBy(profiles, profile => profile.accountInfo.status),
          topCustomers: profiles
            .sort((a, b) => b.orderHistory.totalSpent - a.orderHistory.totalSpent)
            .slice(0, 10)
            .map(p => ({
              name: p.personalInfo.name,
              email: p.personalInfo.email,
              totalSpent: p.orderHistory.totalSpent,
              totalOrders: p.orderHistory.totalOrders
            }))
        },
        productMetrics: {
          topProducts: this.getTopProducts(orders),
          categoryBreakdown: this.getCategoryBreakdown(orders)
        }
      }

      return analytics
    } catch (error) {
      console.error('Error generating analytics report:', error)
      throw error
    }  }

  // Private helper methods
  private static transformOrderToExtractedData(order: Order): ExtractedOrderData {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = order.totalAmount - subtotal

    // Handle cases where shipping address might be undefined or incomplete
    const defaultAddress = {
      street: 'N/A',
      city: 'N/A', 
      state: 'N/A',
      pincode: 'N/A'
    }
    
    const shippingAddr = order.shippingAddress || defaultAddress
    const street = shippingAddr.street || 'N/A'
    const city = shippingAddr.city || 'N/A'
    const state = shippingAddr.state || 'N/A'
    const pincode = shippingAddr.pincode || 'N/A'

    return {
      id: order.id || '',
      orderNumber: `GS${order.id?.slice(-8) || ''}`,
      customerInfo: {
        name: order.customerName || 'Unknown Customer',
        email: order.customerEmail || 'no-email@example.com',
        phone: order.customerPhone
      },
      shippingAddress: {
        street,
        city,
        state,
        pincode,
        fullAddress: `${street}, ${city}, ${state} - ${pincode}`
      },
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        image: item.image
      })),
      orderSummary: {
        subtotal,
        tax,
        totalAmount: order.totalAmount,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
      },
      paymentInfo: {
        method: order.paymentMethod,
        status: order.paymentStatus
      },
      orderStatus: {
        current: order.status
      },
      timestamps: {
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },
      notes: order.notes
    }
  }

  private static transformCustomerToExtractedProfile(customer: Customer, orders: ExtractedOrderData[]): ExtractedCustomerProfile {
    const categories = orders.flatMap(order => 
      order.items.map(item => 'General') // We don't have category data in orders
    )
    const favoriteCategories = [...new Set(categories)]

    return {
      id: customer.id,
      personalInfo: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      },
      address: {
        primary: customer.address,
        shipping: []
      },
      accountInfo: {
        joinDate: customer.joinDate,
        status: customer.status,
        emailVerified: true // Default assumption
      },
      orderHistory: {
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        averageOrderValue: customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0,
        lastPurchase: customer.lastPurchase,
        favoriteCategories
      },
      preferences: {
        newsletter: true, // Default assumption
        smsNotifications: false,
        currency: 'INR',
        language: 'en'
      },
      orderSummary: orders
    }
  }

  private static async getFilteredOrders(filters?: DataExtractionFilters): Promise<Order[]> {
    let orders = await FirebaseOrdersService.getOrders()
    return this.applyOrderFilters(orders, filters)
  }

  private static applyOrderFilters(orders: Order[], filters?: DataExtractionFilters): Order[] {
    if (!filters) return orders

    let filtered = orders

    if (filters.dateRange) {
      filtered = filtered.filter(order => {
        const orderDate = order.createdAt
        return orderDate >= filters.dateRange!.startDate && orderDate <= filters.dateRange!.endDate
      })
    }

    if (filters.orderStatus) {
      filtered = filtered.filter(order => filters.orderStatus!.includes(order.status))
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(order => filters.paymentMethod!.includes(order.paymentMethod))
    }

    if (filters.minOrderValue) {
      filtered = filtered.filter(order => order.totalAmount >= filters.minOrderValue!)
    }

    if (filters.maxOrderValue) {
      filtered = filtered.filter(order => order.totalAmount <= filters.maxOrderValue!)
    }

    return filtered
  }

  private static groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item)
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }

  private static groupOrdersByMonth(orders: ExtractedOrderData[]): Record<string, ExtractedOrderData[]> {
    return this.groupBy(orders, order => {
      const date = order.timestamps.createdAt
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    })
  }

  private static getTopProducts(orders: ExtractedOrderData[]) {
    const productStats = new Map<string, { name: string; quantity: number; revenue: number }>()

    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productStats.get(item.productId) || { name: item.productName, quantity: 0, revenue: 0 }
        existing.quantity += item.quantity
        existing.revenue += item.totalPrice
        productStats.set(item.productId, existing)
      })
    })

    return Array.from(productStats.entries())
      .map(([id, stats]) => ({ productId: id, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }

  private static getCategoryBreakdown(orders: ExtractedOrderData[]) {
    // Since we don't have category data in orders, return a generic breakdown
    const totalRevenue = orders.reduce((sum, order) => sum + order.orderSummary.totalAmount, 0)
    return [
      { category: 'General', revenue: totalRevenue, percentage: 100 }
    ]
  }
}

