import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { AlertError } from '@/components/alert-error'
import { PaymentOptions } from '@/components/payment-options'
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

interface PaymentOption {
  type: string
  label: string
  amount: number
  wallet_amount: number
  paypal_amount: number
  available: boolean
}

interface ClientOrderManagementProps {
  initialOrders?: Order[]
  filter?: 'all' | 'placed' | 'active' | 'completed' | 'cancelled'
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

export function ClientOrderManagement({ initialOrders, filter = 'all' }: ClientOrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders || [])
  const [isLoading, setIsLoading] = useState(!initialOrders)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState(filter)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([])
  const [walletBalance, setWalletBalance] = useState(0)

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
      if (selectedFilter !== 'all') {
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

  const handlePlaceOrder = () => {
    router.visit('/dashboard/orders/create')
  }

  const handlePaymentOptions = async (order: Order) => {
    try {
      const [paymentOptionsResponse, walletResponse] = await Promise.all([
        fetch(`/api/orders/${order.id}/payment-options`),
        fetch('/api/wallet'),
      ])

      if (!paymentOptionsResponse.ok || !walletResponse.ok) {
        throw new Error('Failed to fetch payment options')
      }

      const [paymentData, walletData] = await Promise.all([
        paymentOptionsResponse.json(),
        walletResponse.json(),
      ])

      setPaymentOptions(paymentData.data.payment_options)
      setWalletBalance(paymentData.data.wallet_balance)
      setSelectedOrder(order)
      setShowPaymentOptions(true)
    } catch (err) {
      setError('Failed to load payment options')
    }
  }

  const handlePaymentSuccess = () => {
    setShowPaymentOptions(false)
    setSelectedOrder(null)
    fetchOrders() // Refresh orders
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

  const canPayForOrder = (order: Order) => {
    return order.status === 'placed'
  }

  const canCancelOrder = (order: Order) => {
    return ['placed', 'active'].includes(order.status)
  }

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order? A refund will be added to your wallet.')) {
      return
    }

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ reason: 'Cancelled by client' }),
      })

      const data = await response.json()

      if (data.success) {
        fetchOrders() // Refresh orders
      } else {
        setError(data.message || 'Failed to cancel order')
      }
    } catch (err) {
      setError('Failed to cancel order')
    }
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
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">
            Track and manage your academic writing orders
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedFilter} onValueChange={setSelectedFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="placed">Pending Payment</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handlePlaceOrder}>
            Place New Order
          </Button>
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
                <div className="text-4xl mb-4">📝</div>
                <div className="text-lg font-medium mb-2">No orders found</div>
                <div className="text-sm mb-4">
                  {selectedFilter === 'all' 
                    ? "You haven't placed any orders yet" 
                    : `No orders found with status: ${selectedFilter}`
                  }
                </div>
                <Button onClick={handlePlaceOrder}>
                  Place Your First Order
                </Button>
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
                        Order #{String(order.id).padStart(4, '0')} • Placed {formatDate(order.created_at)}
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

                  {/* Writer Assignment */}
                  {order.writer && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Assigned Writer</div>
                      <div className="font-medium">{order.writer.name}</div>
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
                    
                    {canPayForOrder(order) && (
                      <Button
                        size="sm"
                        onClick={() => handlePaymentOptions(order)}
                      >
                        Pay Now
                      </Button>
                    )}

                    {canCancelOrder(order) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Payment Options Modal */}
      {showPaymentOptions && selectedOrder && (
        <Card className="fixed inset-4 z-50 overflow-y-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Payment Options - Order #{selectedOrder.id}</CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPaymentOptions(false)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PaymentOptions
              orderId={selectedOrder.id}
              orderAmount={selectedOrder.price}
              walletBalance={walletBalance}
              paymentOptions={paymentOptions}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </CardContent>
        </Card>
      )}

      {/* Order Details Modal */}
      {selectedOrder && !showPaymentOptions && (
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
