import { ProductService } from '@/lib/firebase/products'

// This function generates all the static paths for the product pages
// at build time when using the static export feature
export async function generateStaticParams() {
  try {
    // Try to fetch actual product IDs from Firebase
    const { products } = await ProductService.getProducts()
    const productIds = products
      .filter(product => product.id) // Ensure we have valid IDs
      .map(product => product.id!)
    
    console.log('Fetched product IDs for static generation:', productIds)
    
    return productIds.map(id => ({
      id,
    }))
  } catch (error) {
    console.error('Error fetching products for static generation:', error)
    
    // Fallback to hardcoded product IDs for static generation
    // Include all known product IDs to prevent missing param errors
    const fallbackProductIds = [
      "product1",
      "product2", 
      "product3",
      "product4",
      "product5",
      "product6",
      "product7",
      "product8",
      "product9",
      "product10",
      "K0LN8pHbtKM6NK6rYGCB", // Added missing product ID
    ]
    
    console.log('Using fallback product IDs:', fallbackProductIds)
    
    return fallbackProductIds.map(id => ({
      id,
    }))
  }
}
