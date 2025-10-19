import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { router } from '@inertiajs/react'
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  DollarSign,
  Settings as SettingsIcon,
  Users,
  FileText,
  Languages,
  Star
} from 'lucide-react'

export default function SettingsIndexPage() {
  const settingsCategories = [
    {
      title: 'Academic Levels',
      description: 'Manage academic levels and their rates',
      icon: GraduationCap,
      href: '/settings/academic-levels',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Subjects',
      description: 'Manage academic subject categories',
      icon: BookOpen,
      href: '/settings/subjects',
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Service Types',
      description: 'Manage work types and pricing increments',
      icon: FileText,
      href: '/settings/service-types',
      color: 'bg-yellow-50 text-yellow-600',
    },
    {
      title: 'Order Rates',
      description: 'Manage urgency rates for different academic levels',
      icon: Clock,
      href: '/settings/order-rates',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      title: 'Languages',
      description: 'Manage language categories and pricing increments',
      icon: Languages,
      href: '/settings/languages',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Additional Features',
      description: 'Manage optional features and add-ons',
      icon: Star,
      href: '/settings/additional-features',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Pricing Presets',
      description: 'Manage pricing presets for orders',
      icon: DollarSign,
      href: '/admin/pricing',
      color: 'bg-purple-50 text-purple-600',
    },
  ]

  return (
    <AppLayout>
      <Head title="Settings" />
      
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage system settings, academic levels, subjects, and pricing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {settingsCategories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card key={category.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.visit(category.href)}
                    >
                      Manage
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                System Overview
              </CardTitle>
              <CardDescription>
                Quick access to system management tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/admin/orders')}
                >
                  <FileText className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Manage Orders</div>
                    <div className="text-sm text-muted-foreground">View and manage all orders</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/admin/dashboard')}
                >
                  <Users className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Admin Dashboard</div>
                    <div className="text-sm text-muted-foreground">System analytics and overview</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.visit('/admin/pricing')}
                >
                  <DollarSign className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Pricing Management</div>
                    <div className="text-sm text-muted-foreground">Configure pricing presets</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
