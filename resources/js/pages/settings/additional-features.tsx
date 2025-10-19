import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { Plus, Edit, Trash2, Star } from 'lucide-react'

interface AdditionalFeature {
  id: number
  name: string
  description: string | null
  type: 'percent' | 'fixed'
  amount: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface AdditionalFeaturesPageProps {
  additionalFeatures: AdditionalFeature[]
}

export default function AdditionalFeaturesPage({ additionalFeatures }: AdditionalFeaturesPageProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'fixed' as 'percent' | 'fixed',
    amount: 0,
    sort_order: 0,
  })

  const handleCreate = () => {
    router.post('/settings/additional-features', formData, {
      onSuccess: () => {
        setIsCreating(false)
        setFormData({ name: '', description: '', type: 'fixed', amount: 0, sort_order: 0 })
      }
    })
  }

  const handleUpdate = (id: number) => {
    router.patch(`/settings/additional-features/${id}`, formData, {
      onSuccess: () => {
        setEditingId(null)
        setFormData({ name: '', description: '', type: 'fixed', amount: 0, sort_order: 0 })
      }
    })
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this additional feature?')) {
      router.delete(`/settings/additional-features/${id}`)
    }
  }

  const startEdit = (feature: AdditionalFeature) => {
    setEditingId(feature.id)
    setFormData({
      name: feature.name,
      description: feature.description || '',
      type: feature.type,
      amount: feature.amount,
      sort_order: feature.sort_order,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ name: '', description: '', type: 'fixed', amount: 0, sort_order: 0 })
  }

  return (
    <AppLayout>
      <Head title="Additional Features" />
      
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Additional Features</h1>
            <p className="text-muted-foreground mt-2">
              Manage optional features and add-ons for orders
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {isCreating ? 'Create New Feature' : 'Edit Feature'}
              </CardTitle>
              <CardDescription>
                {isCreating ? 'Add a new additional feature' : 'Update the selected feature'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Plagiarism Report"
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this feature"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Pricing Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'percent' | 'fixed') => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percent">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">
                    {formData.type === 'fixed' ? 'Amount ($)' : 'Percentage (%)'}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder={formData.type === 'fixed' ? '15.00' : '20'}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={isCreating ? handleCreate : () => handleUpdate(editingId!)}
                  disabled={!formData.name || formData.amount <= 0}
                >
                  {isCreating ? 'Create' : 'Update'}
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features List */}
        <div className="space-y-4">
          {additionalFeatures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Additional Features</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first additional feature to get started.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </CardContent>
            </Card>
          ) : (
            additionalFeatures.map((feature) => (
              <Card key={feature.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{feature.name}</h3>
                        <Badge variant={feature.type === 'fixed' ? 'default' : 'secondary'}>
                          {feature.type === 'fixed' ? 'Fixed' : 'Percentage'}
                        </Badge>
                        <Badge variant="outline">
                          {feature.type === 'fixed' ? `$${feature.amount}` : `${feature.amount}%`}
                        </Badge>
                      </div>
                      {feature.description && (
                        <p className="text-muted-foreground text-sm mb-2">{feature.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Sort Order: {feature.sort_order}</span>
                        <span>Created: {new Date(feature.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(feature)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(feature.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  )
}
