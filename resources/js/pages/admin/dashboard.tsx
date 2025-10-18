import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

interface AdminDashboardPageProps {
  stats?: {
    orders: {
      total_orders: number
      pending_orders: number
      active_orders: number
      completed_orders: number
      cancelled_orders: number
      total_revenue: number
    }
    payments: {
      total_payments: number
      completed_payments: number
      pending_payments: number
      failed_payments: number
      refunded_payments: number
      total_revenue: number
      total_refunds: number
      net_revenue: number
    }
    wallets: {
      total_wallets: number
      total_balance: number
      total_transactions: number
      average_balance: number
      total_credits: number
      total_debits: number
    }
  }
  errors?: Record<string, string>
}

export default function AdminDashboardPage({ stats, errors }: AdminDashboardPageProps) {
  return (
    <AppLayout>
      <Head title="Admin Dashboard" />
      
      <div className="container mx-auto py-6">
        <AdminDashboard initialStats={stats} />
      </div>
    </AppLayout>
  )
}
