import { Metadata } from 'next'
import ProductClient from './product-client'

// Export the generateStaticParams function from the utility file
export { generateStaticParams } from './generateStaticParams'

// Metadata for SEO - static metadata for static generation
export const metadata: Metadata = {
  title: 'Product Details | Saanvika',
  description: 'View detailed information about this beautiful product',
}

// The main page component uses the client component for dynamic functionality
export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductClient id={params.id} />
}