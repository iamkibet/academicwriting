import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { AlertError } from '@/components/alert-error'
import { WalletBalance } from '@/components/wallet-balance'
import { OrderTracking } from '@/components/order-tracking'

interface ClientStats {
  total_orders: number
  pending_orders: number
  active_orders: number
  completed_orders: number
  cancelled_orders: number
  total_spent: number
}

interface WalletData {
  balance: number
  formatted_balance: string
  statistics: {
    current_balance: number
    total_credits: number
    total_debits: number
    total_transactions: number
    credit_transactions: number
    debit_transactions: number
  }
}

interface ClientDashboardProps {
  initialStats?: ClientStats
  initialWallet?: WalletData
  initialOrders?: any[]
}

export function ClientDashboard({ initialStats, initialWallet, initialOrders }: ClientDashboardProps) {
  const [stats, setStats] = useState<ClientStats | null>(initialStats || null)
  const [walletData, setWalletData] = useState<WalletData | null>(initialWallet || null)
  const [recentOrders, setRecentOrders] = useState<any[]>(initialOrders || [])
  const [isLoading, setIsLoading] = useState(!initialStats)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialStats) {
      fetchDashboardData()
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [ordersResponse, walletResponse, recentOrdersResponse] = await Promise.all([
        fetch('/api/orders?status=all'),
        fetch('/api/wallet'),
        fetch('/api/orders?limit=5'),
      ])

      if (!ordersResponse.ok || !walletResponse.ok || !recentOrdersResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [ordersData, walletData, recentOrdersData] = await Promise.all([
        ordersResponse.json(),
        walletResponse.json(),
        recentOrdersResponse.json(),
      ])

      // Calculate stats from orders
      const orders = ordersData.data
      const clientStats: ClientStats = {
        total_orders: orders.length,
        pending_orders: orders.filter((o: any) => o.status === 'placed').length,
        active_orders: orders.filter((o: any) => ['active', 'assigned', 'in_progress', 'submitted', 'waiting_for_review', 'in_revision'].includes(o.status)).length,
        completed_orders: orders.filter((o: any) => o.status === 'completed').length,
        cancelled_orders: orders.filter((o: any) => o.status === 'cancelled').length,
        total_spent: orders.filter((o: any) => o.status === 'completed').reduce((sum: number, o: any) => sum + o.price, 0),
      }

      setStats(clientStats)
      setWalletData(walletData.data)
      setRecentOrders(recentOrdersData.data.slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your orders and track your progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.visit('/orders/create')} variant="outline">
            Place New Order
          </Button>
          <Button onClick={fetchDashboardData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.active_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_orders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(stats.total_spent)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <div className="lg:col-span-1">
          <WalletBalance showTransactions={false} showTopUpButton={true} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/orders/create')}
                >
                  <div className="text-2xl">📝</div>
                  <div>
                    <div className="font-semibold">Place New Order</div>
                    <div className="text-sm text-muted-foreground">
                      Start a new academic writing project
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/orders')}
                >
                  <div className="text-2xl">📋</div>
                  <div>
                    <div className="font-semibold">View All Orders</div>
                    <div className="text-sm text-muted-foreground">
                      Track all your orders
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/orders?status=placed')}
                >
                  <div className="text-2xl">⏳</div>
                  <div>
                    <div className="font-semibold">Pending Orders</div>
                    <div className="text-sm text-muted-foreground">
                      Orders awaiting payment
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/orders?status=active')}
                >
                  <div className="text-2xl">⚡</div>
                  <div>
                    <div className="font-semibold">Active Orders</div>
                    <div className="text-sm text-muted-foreground">
                      Orders in progress
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/orders?status=completed')}
                >
                  <div className="text-2xl">✅</div>
                  <div>
                    <div className="font-semibold">Completed Orders</div>
                    <div className="text-sm text-muted-foreground">
                      Finished projects
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/wallet')}
                >
                  <div className="text-2xl">💰</div>
                  <div>
                    <div className="font-semibold">Wallet & Payments</div>
                    <div className="text-sm text-muted-foreground">
                      Manage your wallet balance
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/settings/profile')}
                >
                  <div className="text-2xl">👤</div>
                  <div>
                    <div className="font-semibold">Account Settings</div>
                    <div className="text-sm text-muted-foreground">
                      Update your profile
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/settings/password')}
                >
                  <div className="text-2xl">🔒</div>
                  <div>
                    <div className="font-semibold">Change Password</div>
                    <div className="text-sm text-muted-foreground">
                      Update your password
                    </div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/settings/two-factor')}
                >
                  <div className="text-2xl">🔐</div>
                  <div>
                    <div className="font-semibold">Two-Factor Auth</div>
                    <div className="text-sm text-muted-foreground">
                      Secure your account
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest order activity</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.visit('/orders')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-4">📝</div>
              <div className="text-lg font-medium mb-2">No orders yet</div>
              <div className="text-sm mb-4">Start by placing your first order</div>
              <Button onClick={() => router.visit('/orders/create')}>
                Place New Order
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 rounded-md border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{order.title}</h4>
                      <Badge 
                        className={`${getStatusColor(order.status)} border-0`}
                      >
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Order #{order.id} • {order.pages} pages • ${Number(order.price).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.visit(`/orders/${order.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions for status display
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

const getStatusColor = (status: string) => statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
const getStatusLabel = (status: string) => statusLabels[status as keyof typeof statusLabels] || status
