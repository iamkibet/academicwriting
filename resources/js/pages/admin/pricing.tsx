import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { AdminPricingManagement } from '@/components/admin/admin-pricing-management'

interface AdminPricingPageProps {
  presets?: any[]
  errors?: Record<string, string>
}

export default function AdminPricingPage({ presets, errors }: AdminPricingPageProps) {
  return (
    <AppLayout>
      <Head title="Pricing Management" />
      
      <div className="container mx-auto py-6">
        <AdminPricingManagement initialPresets={presets} />
      </div>
    </AppLayout>
  )
}
