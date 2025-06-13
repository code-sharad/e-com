import { getFirestore } from '@/lib/firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

export async function seedCustomers() {
  const db = await getFirestore()
  const customers = [
    {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, Country',
      createdAt: Timestamp.now()
    },
    // Add more sample customers as needed
  ]

  try {
    for (const customer of customers) {
      await addDoc(collection(db, 'customers'), customer)
    }
    console.log('Sample customers added successfully')
  } catch (error) {
    console.error('Error adding sample customers:', error)
  }
}

export async function seedProducts() {
  const db = await getFirestore()
  const products = [
    {
      name: 'Sample Product 1',
      description: 'This is a sample product description',
      price: 99.99,
      comparePrice: 129.99,
      category: 'Electronics',
      imageUrl: '/placeholder.svg',
      stock: 100,
      createdAt: Timestamp.now()
    },
    // Add more sample products as needed
  ]

  try {
    for (const product of products) {
      await addDoc(collection(db, 'products'), product)
    }
    console.log('Sample products added successfully')
  } catch (error) {
    console.error('Error adding sample products:', error)
  }
}

export async function seedOrders() {
  const db = await getFirestore()
  const orders = [
    {
      customerId: 'sample-customer-id',
      items: [
        {
          productId: 'sample-product-id',
          name: 'Sample Product',
          price: 99.99,
          quantity: 2
        }
      ],
      totalAmount: 199.98,
      status: 'pending',
      createdAt: Timestamp.now()
    },
    // Add more sample orders as needed
  ]

  try {
    for (const order of orders) {
      await addDoc(collection(db, 'orders'), order)
    }
    console.log('Sample orders added successfully')
  } catch (error) {
    console.error('Error adding sample orders:', error)
  }
} 
