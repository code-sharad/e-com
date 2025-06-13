// Force dynamic rendering for admin pages that require authentication
export const dynamic = 'force-dynamic'

import { ProtectedRoute } from '@/components/auth/protected-route'
import AdminProductsClient from './admin-products-client'

export default function AdminProductsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminProductsClient />
    </ProtectedRoute>
  )
}

