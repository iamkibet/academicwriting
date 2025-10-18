import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { AlertError } from '@/components/alert-error'

interface DashboardStats {
  total_orders: number
  pending_orders: number
  active_orders: number
  completed_orders: number
  cancelled_orders: number
  total_revenue: number
}

interface PaymentStats {
  total_payments: number
  completed_payments: number
  pending_payments: number
  failed_payments: number
  refunded_payments: number
  total_revenue: number
  total_refunds: number
  net_revenue: number
}

interface WalletStats {
  total_wallets: number
  total_balance: number
  total_transactions: number
  average_balance: number
  total_credits: number
  total_debits: number
}

interface AdminDashboardProps {
  initialStats?: {
    orders: DashboardStats
    payments: PaymentStats
    wallets: WalletStats
  }
}

export function AdminDashboard({ initialStats }: AdminDashboardProps) {
  const [stats, setStats] = useState(initialStats)
  const [isLoading, setIsLoading] = useState(!initialStats)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialStats) {
      fetchStats()
    }
  }, [])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [ordersResponse, paymentsResponse, walletsResponse] = await Promise.all([
        fetch('/api/orders/statistics'),
        fetch('/api/payments/statistics'),
        fetch('/api/wallet/statistics'),
      ])

      if (!ordersResponse.ok || !paymentsResponse.ok || !walletsResponse.ok) {
        throw new Error('Failed to fetch dashboard statistics')
      }

      const [ordersData, paymentsData, walletsData] = await Promise.all([
        ordersResponse.json(),
        paymentsResponse.json(),
        walletsResponse.json(),
      ])

      setStats({
        orders: ordersData.data,
        payments: paymentsData.data.payment_statistics,
        wallets: walletsData.data.statistics,
      })
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

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No statistics available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage orders, payments, and system settings
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline">
          Refresh Stats
        </Button>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.total_orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.orders.pending_orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.orders.active_orders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.orders.completed_orders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.payments.total_revenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.payments.net_revenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.payments.total_refunds)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Statistics</CardTitle>
            <CardDescription>Overview of payment processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-lg font-semibold text-green-600">
                  {stats.payments.completed_payments}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-lg font-semibold text-yellow-600">
                  {stats.payments.pending_payments}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Failed</div>
                <div className="text-lg font-semibold text-red-600">
                  {stats.payments.failed_payments}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Refunded</div>
                <div className="text-lg font-semibold text-orange-600">
                  {stats.payments.refunded_payments}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Statistics</CardTitle>
            <CardDescription>Client wallet overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Wallets</div>
                <div className="text-lg font-semibold">{stats.wallets.total_wallets}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Balance</div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatCurrency(stats.wallets.total_balance)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Balance</div>
                <div className="text-lg font-semibold">
                  {formatCurrency(stats.wallets.average_balance)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Transactions</div>
                <div className="text-lg font-semibold">{stats.wallets.total_transactions}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.visit('/admin/orders/pending')}
            >
              <div className="text-2xl">📋</div>
              <div>
                <div className="font-semibold">Review Orders</div>
                <div className="text-sm text-muted-foreground">
                  {stats.orders.pending_orders} pending
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.visit('/admin/orders/active')}
            >
              <div className="text-2xl">⚡</div>
              <div>
                <div className="font-semibold">Manage Active</div>
                <div className="text-sm text-muted-foreground">
                  {stats.orders.active_orders} active
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => router.visit('/admin/pricing')}
            >
              <div className="text-2xl">💰</div>
              <div>
                <div className="font-semibold">Pricing Settings</div>
                <div className="text-sm text-muted-foreground">
                  Manage pricing presets
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
