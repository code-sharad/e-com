import { getFirestore } from '@/lib/firebase'
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where, orderBy, Timestamp, onSnapshot, Unsubscribe } from 'firebase/firestore'
import { FirebaseOrdersService, Order } from '@/lib/firebase/orders'
import { FirebaseUsersService, UserProfile } from '@/lib/firebase/users'

export interface Customer {
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
  status: 'active' | 'inactive' | 'blocked'
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

export class CustomerService {
  // Store active listeners for cleanup
  private static activeListeners: Map<string, Unsubscribe> = new Map()

  private static async getCollection() {
    const db = await getFirestore()
    return collection(db, 'customers')
  }  static async getAllCustomers(): Promise<Customer[]> {
    try {
      console.log('CustomerService: Fetching comprehensive customer data...')
      
      // Get all users from the users collection
      const users = await FirebaseUsersService.getUsers()
      console.log('CustomerService: Found', users.length, 'users')
      
      // Get all orders to calculate customer statistics
      const allOrders = await FirebaseOrdersService.getOrders()
      console.log('CustomerService: Found', allOrders.length, 'orders')
      
      // Create a map to aggregate customer data
      const customerMap = new Map<string, Customer>()
      
      // First, process all users to create base customer records
      for (const user of users) {
        customerMap.set(user.email, {
          id: user.id || user.email,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address ? {
            street: user.address.street,
            city: user.address.city,
            state: user.address.state,
            pincode: user.address.pincode,
            full: `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.pincode}`.trim()
          } : undefined,
          joinDate: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          status: 'active', // Default status, can be overridden
          isAdmin: user.isAdmin || false,
          preferences: {
            newsletter: false, // Default values
            notifications: true
          },
          orders: []
        })
      }
      
      // Process orders to calculate statistics and populate order history
      const ordersByCustomer = new Map<string, Order[]>()
      
      for (const order of allOrders) {
        if (!ordersByCustomer.has(order.customerEmail)) {
          ordersByCustomer.set(order.customerEmail, [])
        }
        ordersByCustomer.get(order.customerEmail)!.push(order)
        
        // If customer doesn't exist in users but has orders, create a basic record
        if (!customerMap.has(order.customerEmail)) {
          customerMap.set(order.customerEmail, {
            id: order.customerEmail,
            name: order.customerName,
            email: order.customerEmail,
            phone: order.customerPhone,
            address: order.shippingAddress ? {
              street: order.shippingAddress.street,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              pincode: order.shippingAddress.pincode,
              full: `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`.trim()
            } : undefined,
            joinDate: order.createdAt, // Use first order date as join date
            totalOrders: 0,
            totalSpent: 0,
            averageOrderValue: 0,
            status: 'active',
            isAdmin: false,
            preferences: {
              newsletter: false,
              notifications: true
            },
            orders: []
          })
        }
      }
      
      // Calculate order statistics for each customer
      for (const [email, orders] of ordersByCustomer) {
        const customer = customerMap.get(email)!
        
        // Calculate order statistics
        const completedOrders = orders.filter(order => order.paymentStatus === 'completed')
        customer.totalOrders = orders.length
        customer.totalSpent = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
        customer.averageOrderValue = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0
        
        // Find last purchase date
        if (completedOrders.length > 0) {
          customer.lastPurchase = completedOrders
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
            .createdAt
        }
        
        // Add recent orders (last 5)
        customer.orders = orders
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map(order => ({
            id: order.id || '',
            orderNumber: order.id || `ORDER-${Date.now()}`,
            date: order.createdAt,
            total: order.totalAmount,
            status: order.status,
            items: order.items.length
          }))
        
        // Determine customer status based on activity
        const daysSinceLastOrder = customer.lastPurchase 
          ? Math.floor((new Date().getTime() - customer.lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
          : null
        
        if (daysSinceLastOrder === null) {
          customer.status = 'inactive' // No orders yet
        } else if (daysSinceLastOrder > 365) {
          customer.status = 'inactive' // No orders in the last year
        } else {
          customer.status = 'active'
        }
      }
      
      // Convert map to array and sort by join date (most recent first)
      const customers = Array.from(customerMap.values())
        .sort((a, b) => b.joinDate.getTime() - a.joinDate.getTime())
      
      console.log('CustomerService: Processed', customers.length, 'customers with comprehensive data')
      return customers
      
    } catch (error) {
      console.error('CustomerService: Error fetching comprehensive customer data:', error)
      // Fallback to basic customer data if comprehensive fetch fails
      return this.getAllCustomersBasic()
    }
  }

  // Fallback method for basic customer data (original implementation)
  private static async getAllCustomersBasic(): Promise<Customer[]> {
    try {
      console.log('CustomerService: Fetching basic customers...')
      const customersCollection = await this.getCollection()
      const querySnapshot = await getDocs(
        query(customersCollection, orderBy('joinDate', 'desc'))
      )
      
      console.log('CustomerService: Found', querySnapshot.size, 'customers')
        return querySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('CustomerService: Processing customer:', doc.id, data)
        const totalOrders = data.totalOrders || 0
        const totalSpent = data.totalSpent || 0
        return {
          id: doc.id,
          name: data.name || 'Unknown',
          email: data.email || '',
          phone: data.phone,
          address: typeof data.address === 'string' 
            ? { full: data.address }
            : data.address || {},
          joinDate: data.joinDate ? (data.joinDate as Timestamp).toDate() : new Date(),
          lastPurchase: data.lastPurchase ? (data.lastPurchase as Timestamp).toDate() : undefined,
          lastLoginAt: data.lastLoginAt ? (data.lastLoginAt as Timestamp).toDate() : undefined,
          totalOrders,
          totalSpent,
          averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
          status: data.status || 'active',
          isAdmin: data.isAdmin || false,
          preferences: data.preferences || {},
          orders: data.orders || []
        }
      })
    } catch (error) {
      console.error('Error fetching customers:', error)
      // Return empty array instead of throwing to prevent app crashes
      return []
    }
  }

  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      console.log('CustomerService: Fetching customer by email:', email)
      
      // Get user profile
      const users = await FirebaseUsersService.getUsers()
      const userProfile = users.find(user => user.email === email)
      
      // Get all orders for this customer
      const orders = await FirebaseOrdersService.getOrders({ customerEmail: email })
      
      // If no user profile and no orders, customer doesn't exist
      if (!userProfile && orders.length === 0) {
        return null
      }
      
      // Build customer data
      const completedOrders = orders.filter(order => order.paymentStatus === 'completed')
      const totalOrders = orders.length
      const totalSpent = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      
      // Use user profile data if available, otherwise use data from most recent order
      const mostRecentOrder = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
      
      const customer: Customer = {
        id: userProfile?.id || email,
        name: userProfile?.name || mostRecentOrder?.customerName || 'Unknown',
        email: email,
        phone: userProfile?.phone || mostRecentOrder?.customerPhone,
        address: userProfile?.address ? {
          street: userProfile.address.street,
          city: userProfile.address.city,
          state: userProfile.address.state,
          pincode: userProfile.address.pincode,
          full: `${userProfile.address.street}, ${userProfile.address.city}, ${userProfile.address.state} ${userProfile.address.pincode}`.trim()
        } : mostRecentOrder?.shippingAddress ? {
          street: mostRecentOrder.shippingAddress.street,
          city: mostRecentOrder.shippingAddress.city,
          state: mostRecentOrder.shippingAddress.state,
          pincode: mostRecentOrder.shippingAddress.pincode,
          full: `${mostRecentOrder.shippingAddress.street}, ${mostRecentOrder.shippingAddress.city}, ${mostRecentOrder.shippingAddress.state} ${mostRecentOrder.shippingAddress.pincode}`.trim()
        } : undefined,
        joinDate: userProfile?.createdAt || mostRecentOrder?.createdAt || new Date(),
        lastLoginAt: userProfile?.lastLoginAt,
        lastPurchase: completedOrders.length > 0 
          ? completedOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
          : undefined,
        totalOrders,
        totalSpent,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        status: this.determineCustomerStatus(orders, userProfile?.lastLoginAt),
        isAdmin: userProfile?.isAdmin || false,
        preferences: {
          newsletter: false, // Default values - could be enhanced
          notifications: true
        },
        orders: orders
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 10) // Get last 10 orders
          .map(order => ({
            id: order.id || '',
            orderNumber: order.id || `ORDER-${Date.now()}`,
            date: order.createdAt,
            total: order.totalAmount,
            status: order.status,
            items: order.items.length
          }))
      }
      
      console.log('CustomerService: Customer data compiled for:', email)
      return customer
      
    } catch (error) {
      console.error('CustomerService: Error fetching customer by email:', error)
      return null
    }
  }
  private static determineCustomerStatus(orders: Order[], lastLoginAt?: Date): 'active' | 'inactive' | 'blocked' {
    if (orders.length === 0) {
      return 'inactive'
    }
    
    const lastOrder = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
    const daysSinceLastOrder = Math.floor((new Date().getTime() - lastOrder.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    // Consider customer inactive if no orders in the last year
    if (daysSinceLastOrder > 365) {
      return 'inactive'
    }
    
    return 'active'
  }

  static async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const customersCollection = await this.getCollection()
      const docRef = doc(customersCollection, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      const data = docSnap.data()
      const totalOrders = data.totalOrders || 0
      const totalSpent = data.totalSpent || 0
      return {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: typeof data.address === 'string' 
          ? { full: data.address }
          : data.address || {},
        joinDate: (data.joinDate as Timestamp).toDate(),
        lastPurchase: data.lastPurchase ? (data.lastPurchase as Timestamp).toDate() : undefined,
        lastLoginAt: data.lastLoginAt ? (data.lastLoginAt as Timestamp).toDate() : undefined,
        totalOrders,
        totalSpent,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
        status: data.status || 'active',
        isAdmin: data.isAdmin || false,
        preferences: data.preferences || {},
        orders: data.orders || []
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
      throw error
    }
  }

  static async updateCustomerStatus(id: string, status: Customer['status']): Promise<void> {
    try {
      const customersCollection = await this.getCollection()
      const docRef = doc(customersCollection, id)
      await updateDoc(docRef, { status })
    } catch (error) {
      console.error('Error updating customer status:', error)
      throw error
    }
  }

  static async getCustomersByStatus(status: Customer['status']): Promise<Customer[]> {
    try {
      const customersCollection = await this.getCollection()
      const querySnapshot = await getDocs(        query(
          customersCollection,
          where('status', '==', status),
          orderBy('joinDate', 'desc')
        )
      )

      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        const totalOrders = data.totalOrders || 0
        const totalSpent = data.totalSpent || 0
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: typeof data.address === 'string' 
            ? { full: data.address }
            : data.address || {},
          joinDate: (data.joinDate as Timestamp).toDate(),
          lastPurchase: data.lastPurchase ? (data.lastPurchase as Timestamp).toDate() : undefined,
          lastLoginAt: data.lastLoginAt ? (data.lastLoginAt as Timestamp).toDate() : undefined,
          totalOrders,
          totalSpent,
          averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
          status: data.status || 'active',
          isAdmin: data.isAdmin || false,
          preferences: data.preferences || {},
          orders: data.orders || []
        }
      })
    } catch (error) {
      console.error('Error fetching customers by status:', error)
      throw error
    }
  }

  static async createCustomer(customerData: Omit<Customer, 'id' | 'joinDate' | 'totalOrders' | 'totalSpent'>): Promise<string> {
    try {
      console.log('CustomerService: Creating new customer:', customerData.email)
      const customersCollection = await this.getCollection()
      const docRef = await addDoc(customersCollection, {
        ...customerData,
        joinDate: Timestamp.now(),
        totalOrders: 0,
        totalSpent: 0,
        status: customerData.status || 'active'
      })
      console.log('CustomerService: Customer created with ID:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  static async updateCustomer(id: string, updates: Partial<Omit<Customer, 'id' | 'joinDate'>>): Promise<void> {
    try {
      console.log('CustomerService: Updating customer:', id, updates)
      const customersCollection = await this.getCollection()
      const docRef = doc(customersCollection, id)
      await updateDoc(docRef, updates)
      console.log('CustomerService: Customer updated successfully')
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }

  static async searchCustomers(searchTerm: string): Promise<Customer[]> {
    try {
      console.log('CustomerService: Searching customers for:', searchTerm)
      const customers = await this.getAllCustomers()
      return customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm))
      )
    } catch (error) {
      console.error('Error searching customers:', error)
      return []
    }
  }

  static async getCustomerStats(): Promise<{
    total: number
    active: number
    inactive: number
    blocked: number
    totalRevenue: number
    averageOrderValue: number
  }> {
    try {
      console.log('CustomerService: Getting customer statistics')
      const customers = await this.getAllCustomers()
      
      const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        inactive: customers.filter(c => c.status === 'inactive').length,
        blocked: customers.filter(c => c.status === 'blocked').length,
        totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
        averageOrderValue: 0
      }
      
      const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0)
      stats.averageOrderValue = totalOrders > 0 ? stats.totalRevenue / totalOrders : 0
      
      console.log('CustomerService: Stats calculated:', stats)
      return stats
    } catch (error) {
      console.error('Error getting customer stats:', error)
      return {
        total: 0,
        active: 0,
        inactive: 0,
        blocked: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      }
    }
  }

  static async updateCustomerOrderStats(customerEmail: string): Promise<void> {
    try {
      console.log('CustomerService: Updating order stats for customer:', customerEmail)
      
      // Get all customers to find the one with this email
      const customers = await this.getAllCustomers()
      const customer = customers.find(c => c.email === customerEmail)
      
      if (!customer) {
        console.log('CustomerService: Customer not found, creating new customer record')
        // If customer doesn't exist, we might need to create them
        // This would typically be done when they place their first order
        return
      }

      // Get all orders for this customer
      const { FirebaseOrdersService } = await import('../firebase/orders')
      const orders = await FirebaseOrdersService.getOrders({ customerEmail })
      
      // Calculate stats
      const totalOrders = orders.length
      const totalSpent = orders
        .filter(order => order.paymentStatus === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0)
      
      const lastPurchase = orders.length > 0 
        ? orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : undefined

      // Update customer record
      await this.updateCustomer(customer.id, {
        totalOrders,
        totalSpent,
        lastPurchase
      })
      
      console.log('CustomerService: Updated customer stats:', { totalOrders, totalSpent })
    } catch (error) {
      console.error('Error updating customer order stats:', error)
      // Don't throw error to avoid breaking order processing
    }
  }

  static async ensureCustomerExists(customerData: {
    name: string
    email: string
    phone?: string
    address?: string
  }): Promise<string> {
    try {
      console.log('CustomerService: Ensuring customer exists:', customerData.email)
      
      // Check if customer already exists
      const customers = await this.getAllCustomers()
      const existingCustomer = customers.find(c => c.email === customerData.email)
      
      if (existingCustomer) {
        console.log('CustomerService: Customer already exists:', existingCustomer.id)
        return existingCustomer.id
      }
        // Create new customer
      const customerId = await this.createCustomer({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: typeof customerData.address === 'string' 
          ? { full: customerData.address }
          : customerData.address,
        status: 'active',
        averageOrderValue: 0
      })
      
      console.log('CustomerService: Created new customer:', customerId)
      return customerId
    } catch (error) {
      console.error('Error ensuring customer exists:', error)
      throw error
    }
  }

  // Sync customer data from orders and user profiles
  static async syncCustomerData(email: string): Promise<void> {
    try {
      console.log('CustomerService: Syncing data for customer:', email)
      
      const customer = await this.getCustomerByEmail(email)
      if (!customer) {
        console.log('CustomerService: Customer not found for syncing:', email)
        return
      }
      
      // Check if customer exists in customers collection
      const customersCollection = await this.getCollection()
      const existingCustomers = await getDocs(
        query(customersCollection, where('email', '==', email))
      )
      
      const customerData = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        joinDate: Timestamp.fromDate(customer.joinDate),
        lastPurchase: customer.lastPurchase ? Timestamp.fromDate(customer.lastPurchase) : null,
        lastLoginAt: customer.lastLoginAt ? Timestamp.fromDate(customer.lastLoginAt) : null,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        averageOrderValue: customer.averageOrderValue,
        status: customer.status,
        isAdmin: customer.isAdmin,
        preferences: customer.preferences,
        orders: customer.orders,
        updatedAt: Timestamp.now()
      }
      
      if (existingCustomers.empty) {
        // Create new customer record
        await addDoc(customersCollection, customerData)
        console.log('CustomerService: Created new customer record for:', email)
      } else {
        // Update existing customer record
        const docRef = doc(customersCollection, existingCustomers.docs[0].id)
        await updateDoc(docRef, customerData)
        console.log('CustomerService: Updated customer record for:', email)
      }
      
    } catch (error) {
      console.error('CustomerService: Error syncing customer data:', error)
      throw error
    }
  }

  // Sync all customer data - useful for data migration or updates
  static async syncAllCustomerData(): Promise<void> {
    try {
      console.log('CustomerService: Starting sync of all customer data...')
      
      // Get all unique customer emails from orders
      const allOrders = await FirebaseOrdersService.getOrders()
      const customerEmails = [...new Set(allOrders.map(order => order.customerEmail))]
      
      // Get all user emails
      const allUsers = await FirebaseUsersService.getUsers()
      const userEmails = allUsers.map(user => user.email)
      
      // Combine and deduplicate emails
      const allEmails = [...new Set([...customerEmails, ...userEmails])]
      
      console.log('CustomerService: Found', allEmails.length, 'unique customers to sync')
      
      // Sync each customer (in batches to avoid overwhelming the database)
      const batchSize = 10
      for (let i = 0; i < allEmails.length; i += batchSize) {
        const batch = allEmails.slice(i, i + batchSize)
        await Promise.all(batch.map(email => this.syncCustomerData(email)))
        console.log('CustomerService: Synced batch', Math.floor(i / batchSize) + 1, 'of', Math.ceil(allEmails.length / batchSize))
      }
      
      console.log('CustomerService: Completed sync of all customer data')
    } catch (error) {
      console.error('CustomerService: Error syncing all customer data:', error)
      throw error
    }
  }

  // Real-time listener for all customers
  static subscribeToCustomers(callback: (customers: Customer[]) => void): Unsubscribe {
    console.log('CustomerService: Setting up real-time customer listener...')
    
    let userListenerUnsubscribe: Unsubscribe | null = null
    let orderListenerUnsubscribe: Unsubscribe | null = null
    
    const processAndNotify = async () => {
      try {
        const customers = await this.getAllCustomers()
        callback(customers)
      } catch (error) {
        console.error('CustomerService: Error in real-time update:', error)
      }
    }

    // Set up listeners for both users and orders
    const setupListeners = async () => {
      try {
        const db = await getFirestore()
        
        // Listen to users collection
        const usersCollection = collection(db, 'users')
        userListenerUnsubscribe = onSnapshot(
          query(usersCollection, orderBy('createdAt', 'desc')),
          (snapshot) => {
            console.log('CustomerService: Users collection updated, refreshing customer data...')
            processAndNotify()
          },
          (error) => {
            console.error('CustomerService: Error in users listener:', error)
          }
        )
        
        // Listen to orders collection
        const ordersCollection = collection(db, 'orders')
        orderListenerUnsubscribe = onSnapshot(
          query(ordersCollection, orderBy('createdAt', 'desc')),
          (snapshot) => {
            console.log('CustomerService: Orders collection updated, refreshing customer data...')
            processAndNotify()
          },
          (error) => {
            console.error('CustomerService: Error in orders listener:', error)
          }
        )
        
        // Initial data load
        processAndNotify()
        
      } catch (error) {
        console.error('CustomerService: Error setting up listeners:', error)
      }
    }

    setupListeners()
    
    // Return cleanup function
    return () => {
      console.log('CustomerService: Cleaning up real-time listeners...')
      if (userListenerUnsubscribe) {
        userListenerUnsubscribe()
      }
      if (orderListenerUnsubscribe) {
        orderListenerUnsubscribe()
      }
    }
  }

  // Real-time listener for a specific customer
  static subscribeToCustomer(email: string, callback: (customer: Customer | null) => void): Unsubscribe {
    console.log('CustomerService: Setting up real-time listener for customer:', email)
    
    let userListenerUnsubscribe: Unsubscribe | null = null
    let orderListenerUnsubscribe: Unsubscribe | null = null
    
    const processAndNotify = async () => {
      try {
        const customer = await this.getCustomerByEmail(email)
        callback(customer)
      } catch (error) {
        console.error('CustomerService: Error in customer real-time update:', error)
        callback(null)
      }
    }

    const setupListeners = async () => {
      try {
        const db = await getFirestore()
        
        // Listen to user profile changes
        const usersCollection = collection(db, 'users')
        userListenerUnsubscribe = onSnapshot(
          query(usersCollection, where('email', '==', email)),
          (snapshot) => {
            console.log('CustomerService: User profile updated for:', email)
            processAndNotify()
          },
          (error) => {
            console.error('CustomerService: Error in user profile listener:', error)
          }
        )
        
        // Listen to order changes for this customer
        const ordersCollection = collection(db, 'orders')
        orderListenerUnsubscribe = onSnapshot(
          query(ordersCollection, where('customerEmail', '==', email)),
          (snapshot) => {
            console.log('CustomerService: Orders updated for customer:', email)
            processAndNotify()
          },
          (error) => {
            console.error('CustomerService: Error in customer orders listener:', error)
          }
        )
        
        // Initial data load
        processAndNotify()
        
      } catch (error) {
        console.error('CustomerService: Error setting up customer listener:', error)
      }
    }

    setupListeners()
    
    // Return cleanup function
    return () => {
      console.log('CustomerService: Cleaning up customer listener for:', email)
      if (userListenerUnsubscribe) {
        userListenerUnsubscribe()
      }
      if (orderListenerUnsubscribe) {
        orderListenerUnsubscribe()
      }
    }
  }

  // Real-time customer statistics listener
  static subscribeToCustomerStats(callback: (stats: {
    total: number
    active: number
    inactive: number
    blocked: number
    totalRevenue: number
    averageOrderValue: number
    newCustomersToday: number
    newCustomersThisWeek: number
  }) => void): Unsubscribe {
    console.log('CustomerService: Setting up real-time stats listener...')
    
    const processStats = async () => {
      try {
        const customers = await this.getAllCustomers()
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        
        const stats = {
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
        stats.averageOrderValue = totalOrders > 0 ? stats.totalRevenue / totalOrders : 0
        
        callback(stats)
      } catch (error) {
        console.error('CustomerService: Error calculating stats:', error)
      }
    }
    
    return this.subscribeToCustomers(() => {
      processStats()
    })
  }

  // Cleanup all active listeners
  static cleanupAllListeners(): void {
    console.log('CustomerService: Cleaning up all active listeners...')
    this.activeListeners.forEach((unsubscribe, key) => {
      unsubscribe()
    })
    this.activeListeners.clear()
  }
}
