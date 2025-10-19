import { Head, Link, useForm } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'

export default function CreateServiceTypePage() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    slug: '',
    description: '',
    inc_type: 'percent' as 'percent' | 'money',
    amount: 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/settings/service-types')
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setData('name', name)
    if (!data.slug || data.slug === generateSlug(data.name)) {
      setData('slug', generateSlug(name))
    }
  }

  return (
    <AppLayout>
      <Head title="Create Service Type" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/settings/service-types">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Service Type</h1>
            <p className="text-gray-600 mt-1">Add a new work type with pricing increment</p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Service Type Details</CardTitle>
            <CardDescription>
              Configure the work type and its pricing increment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Essay, Research Paper, Thesis"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={data.slug}
                  onChange={(e) => setData('slug', e.target.value)}
                  placeholder="e.g., essay, research-paper, thesis"
                  className={errors.slug ? 'border-red-500' : ''}
                />
                {errors.slug && (
                  <p className="text-sm text-red-600">{errors.slug}</p>
                )}
                <p className="text-sm text-gray-500">
                  URL-friendly version of the name (auto-generated from name)
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Brief description of this work type"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Increment Type */}
              <div className="space-y-2">
                <Label htmlFor="inc_type">Increment Type *</Label>
                <Select value={data.inc_type} onValueChange={(value: 'percent' | 'money') => setData('inc_type', value)}>
                  <SelectTrigger className={errors.inc_type ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                    <SelectItem value="money">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.inc_type && (
                  <p className="text-sm text-red-600">{errors.inc_type}</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.amount}
                  onChange={(e) => setData('amount', parseFloat(e.target.value) || 0)}
                  placeholder={data.inc_type === 'percent' ? 'e.g., 20 for 20%' : 'e.g., 15.00 for $15'}
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount}</p>
                )}
                <p className="text-sm text-gray-500">
                  {data.inc_type === 'percent' 
                    ? 'Percentage increase (e.g., 20 for 20% increase)'
                    : 'Fixed amount increase (e.g., 15.00 for $15 increase)'
                  }
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Link href="/settings/service-types">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  <Save className="w-4 h-4 mr-2" />
                  {processing ? 'Creating...' : 'Create Service Type'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
