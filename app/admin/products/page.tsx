import { ProtectedRoute } from '@/components/protected-route'
import AdminProductsClient from './admin-products-client'

export default function AdminProductsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminProductsClient />
    </ProtectedRoute>
  )
}
