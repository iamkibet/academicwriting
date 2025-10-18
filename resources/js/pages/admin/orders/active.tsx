import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { AdminOrderManagement } from '@/components/admin/admin-order-management'

interface AdminActiveOrdersPageProps {
  orders?: any[]
  errors?: Record<string, string>
}

export default function AdminActiveOrdersPage({ orders, errors }: AdminActiveOrdersPageProps) {
  return (
    <AppLayout>
      <Head title="Active Orders" />
      
      <div className="container mx-auto py-6">
        <AdminOrderManagement 
          initialOrders={orders}
          filter="active"
        />
      </div>
    </AppLayout>
  )
}
