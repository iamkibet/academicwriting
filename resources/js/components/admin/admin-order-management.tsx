import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { AlertError } from '@/components/alert-error'
import { OrderTracking } from '@/components/order-tracking'

interface Order {
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
  client?: {
    id: number
    name: string
    email: string
  }
  writer?: {
    id: number
    name: string
    email: string
  }
  payments?: Array<{
    id: number
    amount: number
    payment_method: string
    status: string
  }>
}

interface AdminOrderManagementProps {
  initialOrders?: Order[]
  filter?: 'all' | 'pending' | 'active' | 'completed' | 'cancelled'
}

const statusColors = {
  placed: 'bg-yellow-100 text-yellow-800',
  active: 'bg-blue-100 text-blue-800',
  assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-orange-100 text-orange-800',
  submitted: 'bg-cyan-100 text-cyan-800',
  waiting_for_review: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  in_revision: 'bg-pink-100 text-pink-800',
}

const statusLabels = {
  placed: 'Placed',
  active: 'Active',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  waiting_for_review: 'Waiting for Review',
  completed: 'Completed',
  cancelled: 'Cancelled',
  in_revision: 'In Revision',
}

export function AdminOrderManagement({ initialOrders, filter = 'all' }: AdminOrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders || [])
  const [isLoading, setIsLoading] = useState(!initialOrders)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState(filter)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!initialOrders) {
      fetchOrders()
    }
  }, [selectedFilter])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)

      let endpoint = '/api/orders'
      if (selectedFilter === 'pending') {
        endpoint = '/api/orders/pending'
      } else if (selectedFilter === 'active') {
        endpoint = '/api/orders/active'
      } else if (selectedFilter !== 'all') {
        endpoint = `/api/orders?status=${selectedFilter}`
      }

      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          admin_notes: 'Order accepted by admin'
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the order in the list
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'active' }
            : order
        ))
      } else {
        setError(data.message || 'Failed to accept order')
      }
    } catch (err) {
      setError('Failed to accept order')
    }
  }

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status updated to ${statusLabels[newStatus as keyof typeof statusLabels]} by admin`
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update the order in the list
        setOrders(prev => prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        ))
      } else {
        setError(data.message || 'Failed to update order status')
      }
    } catch (err) {
      setError('Failed to update order status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getDaysUntilDeadline = (deadlineDate: string) => {
    const deadline = new Date(deadlineDate)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const canAcceptOrder = (order: Order) => {
    return order.status === 'placed'
  }

  const canUpdateStatus = (order: Order) => {
    return ['active', 'assigned', 'in_progress', 'submitted', 'waiting_for_review'].includes(order.status)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <AlertError errors={{ general: error }} />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">
            Manage and track all orders
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                No orders found
              </div>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => {
            const daysUntilDeadline = getDaysUntilDeadline(order.deadline_date)
            const isOverdue = daysUntilDeadline < 0
            const isUrgent = daysUntilDeadline <= 2 && daysUntilDeadline >= 0

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.title}</CardTitle>
                      <CardDescription>
                        Order #{String(order.id).padStart(4, '0')} • Client: {order.client?.name || 'Unknown'} • 
                        Placed {formatDate(order.created_at)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`${statusColors[order.status as keyof typeof statusColors]} border-0`}
                      >
                        {statusLabels[order.status as keyof typeof statusLabels]}
                      </Badge>
                      {isOverdue && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                      {isUrgent && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Academic Level</div>
                      <div className="font-medium capitalize">
                        {order.academic_level?.level || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Service Type</div>
                      <div className="font-medium capitalize">
                        {order.service_type?.label || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Pages / Words</div>
                      <div className="font-medium">
                        {order.pages} pages / {order.words.toLocaleString()} words
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-medium text-lg">${Number(order.price).toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="p-3 rounded-md bg-muted/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Deadline</div>
                        <div className={`text-sm ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : ''}`}>
                          {formatDate(order.deadline_date)}
                          {isOverdue && ' (Overdue)'}
                          {isUrgent && ' (Urgent)'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Days Remaining</div>
                        <div className={`font-bold ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : ''}`}>
                          {daysUntilDeadline}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Description</div>
                    <div className="text-sm bg-muted/30 p-3 rounded-md max-h-24 overflow-y-auto">
                      {order.description}
                    </div>
                  </div>

                  {/* Payment Status */}
                  {order.payments && order.payments.length > 0 && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Payment</div>
                      <div className="flex gap-2">
                        {order.payments.map((payment) => (
                          <Badge key={payment.id} variant="outline">
                            {payment.payment_method} • {payment.status} • ${payment.amount.toFixed(2)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </Button>
                    
                    {canAcceptOrder(order) && (
                      <Button
                        size="sm"
                        onClick={() => handleAcceptOrder(order.id)}
                      >
                        Accept Order
                      </Button>
                    )}

                    {canUpdateStatus(order) && (
                      <Select 
                        onValueChange={(value) => handleUpdateStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assigned">Assign to Writer</SelectItem>
                          <SelectItem value="in_progress">Mark In Progress</SelectItem>
                          <SelectItem value="submitted">Mark Submitted</SelectItem>
                          <SelectItem value="waiting_for_review">Waiting for Review</SelectItem>
                          <SelectItem value="completed">Mark Completed</SelectItem>
                          <SelectItem value="cancelled">Cancel Order</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Order Details Modal/View */}
      {selectedOrder && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Order Details - #{selectedOrder.id}</CardTitle>
                <CardDescription>Complete order information</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <OrderTracking orderId={selectedOrder.id} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
