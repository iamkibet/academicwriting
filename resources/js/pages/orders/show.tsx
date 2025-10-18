import { Head } from '@inertiajs/react'
import { OrderTracking } from '@/components/order-tracking'

interface OrderShowPageProps {
  order: {
    id: number
    title: string
    description: string
    academic_level: string
    service_type: string
    deadline_type: string
    deadline_date: string
    pages: number
    words: number
    price: number
    status: string
    client_id: number
    writer_id?: number
    admin_notes?: string
    client_notes?: string
    created_at: string
    updated_at: string
  }
  errors?: Record<string, string>
}

export default function OrderShowPage({ order, errors }: OrderShowPageProps) {
  return (
    <>
      <Head title={`Order #${order.id}`} />
      
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{order.title}</h1>
          <p className="text-muted-foreground">
            Order #{order.id} • Placed {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <OrderTracking orderId={order.id} />
      </div>
    </>
  )
}
