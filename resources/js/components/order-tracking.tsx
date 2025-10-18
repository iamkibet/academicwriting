import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { AlertError } from '@/components/alert-error'

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
  status_history?: Array<{
    id: number
    status: string
    previous_status?: string
    notes?: string
    created_at: string
    changed_by?: {
      id: number
      name: string
    }
  }>
}

interface OrderTrackingProps {
  orderId?: number
  showAllOrders?: boolean
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

const academicLevelLabels = {
  high_school: 'High School',
  college: 'College',
  graduate: 'Graduate',
  phd: 'PhD',
}

const serviceTypeLabels = {
  essay: 'Essay',
  research_paper: 'Research Paper',
  thesis: 'Thesis',
  dissertation: 'Dissertation',
}

const deadlineTypeLabels = {
  standard: 'Standard (7+ days)',
  rush: 'Rush (3-6 days)',
  ultra_rush: 'Ultra Rush (1-2 days)',
}

export function OrderTracking({ orderId, showAllOrders = false }: OrderTrackingProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
  }, [orderId, showAllOrders])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)

      let endpoint = '/api/orders'
      if (orderId) {
        endpoint = `/api/orders/${orderId}`
      }

      const response = await fetch(endpoint)
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      
      if (orderId) {
        setOrders([data.data])
      } else {
        setOrders(data.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
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

  const canCancelOrder = (order: Order) => {
    return ['placed', 'active', 'assigned'].includes(order.status)
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
        // Refresh orders
        fetchOrders()
      } else {
        setError(data.message || 'Failed to cancel order')
      }
    } catch (err) {
      setError('Failed to cancel order')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Spinner className="w-6 h-6" />
            <span className="ml-2">Loading orders...</span>
          </div>
        </CardContent>
      </Card>
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

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No orders found
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => {
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
                    Order #{order.id} • Placed {formatDate(order.created_at)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`${statusColors[order.status as keyof typeof statusColors]} border-0`}
                  >
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </Badge>
                  {canCancelOrder(order) && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Academic Level</h4>
                  <p className="text-sm">
                    {academicLevelLabels[order.academic_level as keyof typeof academicLevelLabels]}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Service Type</h4>
                  <p className="text-sm">
                    {serviceTypeLabels[order.service_type as keyof typeof serviceTypeLabels]}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Deadline</h4>
                  <p className={`text-sm ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : ''}`}>
                    {formatDate(order.deadline_date)}
                    {isOverdue && ' (Overdue)'}
                    {isUrgent && ' (Urgent)'}
                  </p>
                </div>
              </div>

              {/* Pages, Words, Price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Pages</h4>
                  <p className="text-sm">{order.pages} pages</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Words</h4>
                  <p className="text-sm">{order.words.toLocaleString()} words</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Price</h4>
                  <p className="text-sm font-semibold">${Number(order.price).toFixed(2)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Description</h4>
                <p className="text-sm bg-muted/50 p-3 rounded-md">
                  {order.description}
                </p>
              </div>

              {/* Writer Assignment */}
              {order.writer && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Assigned Writer</h4>
                  <p className="text-sm">{order.writer.name}</p>
                </div>
              )}

              {/* Payment Status */}
              {order.payments && order.payments.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">Payment</h4>
                  <div className="space-y-1">
                    {order.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between text-sm">
                        <span>
                          {payment.payment_method} • {payment.status}
                        </span>
                        <span className="font-semibold">${payment.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status History */}
              {order.status_history && order.status_history.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Status History</h4>
                  <div className="space-y-2">
                    {order.status_history
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((history) => (
                        <div key={history.id} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                          <div>
                            <span className="font-medium">
                              {statusLabels[history.status as keyof typeof statusLabels]}
                            </span>
                            {history.notes && (
                              <span className="text-muted-foreground ml-2">• {history.notes}</span>
                            )}
                          </div>
                          <div className="text-muted-foreground">
                            {formatDate(history.created_at)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
