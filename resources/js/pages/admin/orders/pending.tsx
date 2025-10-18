import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { AdminOrderManagement } from '@/components/admin/admin-order-management'

interface AdminPendingOrdersPageProps {
  orders?: any[]
  errors?: Record<string, string>
}

export default function AdminPendingOrdersPage({ orders, errors }: AdminPendingOrdersPageProps) {
  return (
    <AppLayout>
      <Head title="Pending Orders" />
      
      <div className="container mx-auto py-6">
        <AdminOrderManagement 
          initialOrders={orders}
          filter="pending"
        />
      </div>
    </AppLayout>
  )
}
