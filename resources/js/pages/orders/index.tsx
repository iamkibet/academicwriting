import { Head } from '@inertiajs/react'
import { ClientOrderManagement } from '@/components/client/client-order-management'

interface OrdersPageProps {
  orders?: any[]
  filter?: 'all' | 'placed' | 'active' | 'completed' | 'cancelled'
  errors?: Record<string, string>
}

export default function OrdersPage({ orders, filter, errors }: OrdersPageProps) {
  return (
    <>
      <Head title="My Orders" />
      
      <div className="container mx-auto py-6">
        <ClientOrderManagement 
          initialOrders={orders}
          filter={filter}
        />
      </div>
    </>
  )
}
