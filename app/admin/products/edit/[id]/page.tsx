import React from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import AdminEditClient from './admin-edit-client'

// Force dynamic rendering for admin pages that require authentication
export const dynamic = 'force-dynamic'

// This is a placeholder for the admin edit product page
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminEditClient id={id} />
    </ProtectedRoute>
  )
}
