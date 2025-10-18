import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { AdminOrderManagement } from '@/components/admin/admin-order-management'

interface AdminOrdersPageProps {
  orders?: any[]
  filter?: 'all' | 'pending' | 'active' | 'completed' | 'cancelled'
  errors?: Record<string, string>
}

export default function AdminOrdersPage({ orders, filter, errors }: AdminOrdersPageProps) {
  return (
    <AppLayout>
      <Head title="Order Management" />
      
      <div className="container mx-auto py-6">
        <AdminOrderManagement 
          initialOrders={orders}
          filter={filter}
        />
      </div>
    </AppLayout>
  )
}
