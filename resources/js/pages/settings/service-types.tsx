import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react'

interface ServiceType {
  id: number
  name: string
  slug: string
  description: string
  inc_type: 'percent' | 'money'
  amount: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ServiceTypesPageProps {
  serviceTypes: ServiceType[]
  flash?: {
    success?: string
    error?: string
  }
}

export default function ServiceTypesPage({ serviceTypes, flash }: ServiceTypesPageProps) {
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this service type?')) {
      router.delete(`/settings/service-types/${id}`)
    }
  }

  const toggleStatus = (id: number, currentStatus: boolean) => {
    router.patch(`/settings/service-types/${id}`, {
      is_active: !currentStatus
    })
  }

  const formatAmount = (serviceType: ServiceType) => {
    if (serviceType.inc_type === 'percent') {
      return `+${serviceType.amount}%`
    } else {
      return `+$${serviceType.amount}`
    }
  }

  return (
    <AppLayout>
      <Head title="Service Types Management" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Service Types</h1>
              <p className="text-gray-600 mt-1">Manage work types and their pricing increments</p>
            </div>
          </div>
          <Link href="/settings/service-types/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Service Type
            </Button>
          </Link>
        </div>

        {/* Flash Messages */}
        {flash?.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {flash.success}
          </div>
        )}

        {flash?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {flash.error}
          </div>
        )}

        {/* Service Types List */}
        <Card>
          <CardHeader>
            <CardTitle>Service Types ({serviceTypes.length})</CardTitle>
            <CardDescription>
              Configure work types and their pricing increments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {serviceTypes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No service types found</p>
                <Link href="/settings/service-types/create">
                  <Button>Create First Service Type</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceTypes.map((serviceType) => (
                  <div
                    key={serviceType.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {serviceType.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {serviceType.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Slug: {serviceType.slug}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created {new Date(serviceType.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={serviceType.is_active ? 'default' : 'secondary'}>
                          {serviceType.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {formatAmount(serviceType)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStatus(serviceType.id, serviceType.is_active)}
                      >
                        {serviceType.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Link href={`/settings/service-types/${serviceType.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(serviceType.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
