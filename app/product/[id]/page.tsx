import { notFound } from "next/navigation"
import { Suspense } from "react"
import Navbar from "@/components/common/navbar"
import Footer from "@/components/common/footer"
import ProductClient from "./product-client"
import { ProductService } from "@/lib/firebase/products"
import { preloadFirebase } from "@/lib/firebase"
import { Metadata } from 'next'
import { Header } from '@/components/layout/header'

// Generate static params for static export
export async function generateStaticParams() {
  // Return empty array for static export - pages will be generated on demand
  return []
}

// Preload Firebase modules
preloadFirebase()

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {  
  try {
    const { id } = await params
    const product = await ProductService.getProduct(id)
    return {
      title: product ? `${product.name} | Your Store` : 'Product Not Found',
      description: product?.description || 'Product details page',
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Product | Your Store',
      description: 'Product details page',
    }
  }
}

// The main page component uses the client component for dynamic functionality
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Pre-fetch the product data on the server
  const { id } = await params
  const product = await ProductService.getProduct(id)
  
  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="product-page-nav">
        <Navbar />
      </div>
      <Suspense fallback={<div>Loading product details...</div>}>
        <ProductClient id={id} initialData={product} />
      </Suspense>
      <Footer />
    </div>
  )
}