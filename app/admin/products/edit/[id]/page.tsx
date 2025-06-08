import React from 'react'
import { ProtectedRoute } from '@/components/protected-route'
import AdminEditClient from './admin-edit-client'

// Add generateStaticParams for static export
export async function generateStaticParams() {
  // Use the same product IDs as the main product pages for consistency
  return [
    { id: 'fSSjDZrFsLmIDLV5F4Sy' },
    { id: 'K0LN8pHbtKM6NK6rYGCB' },
    // Fallback placeholder IDs for development
    { id: 'product1' },
    { id: 'product2' },
    { id: 'product3' },
  ]
}

// This is a placeholder for the admin edit product page
export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminEditClient id={params.id} />
    </ProtectedRoute>
  )
}
