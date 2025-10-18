import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { AlertError } from '@/components/alert-error'

interface PricingPreset {
  id: number
  name: string
  academic_level: string
  service_type: string
  deadline_type: string
  base_price_per_page: number
  multiplier: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AdminPricingManagementProps {
  initialPresets?: PricingPreset[]
}

const academicLevels = {
  high_school: 'High School',
  college: 'College',
  graduate: 'Graduate',
  phd: 'PhD',
}

const serviceTypes = {
  essay: 'Essay',
  research_paper: 'Research Paper',
  thesis: 'Thesis',
  dissertation: 'Dissertation',
}

const deadlineTypes = {
  standard: 'Standard (7+ days)',
  rush: 'Rush (3-6 days)',
  ultra_rush: 'Ultra Rush (1-2 days)',
}

export function AdminPricingManagement({ initialPresets }: AdminPricingManagementProps) {
  const [presets, setPresets] = useState<PricingPreset[]>(initialPresets || [])
  const [isLoading, setIsLoading] = useState(!initialPresets)
  const [error, setError] = useState<string | null>(null)
  const [editingPreset, setEditingPreset] = useState<PricingPreset | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    name: '',
    academic_level: '',
    service_type: '',
    deadline_type: '',
    base_price_per_page: 0,
    multiplier: 1,
    is_active: true,
  })

  useEffect(() => {
    if (!initialPresets) {
      fetchPresets()
    }
  }, [])

  const fetchPresets = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/pricing/presets')
      
      if (!response.ok) {
        throw new Error('Failed to fetch pricing presets')
      }

      const data = await response.json()
      setPresets(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePreset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/pricing/presets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setPresets(prev => [...prev, data.data])
        setIsCreating(false)
        resetForm()
      } else {
        setError(data.message || 'Failed to create pricing preset')
      }
    } catch (err) {
      setError('Failed to create pricing preset')
    }
  }

  const handleUpdatePreset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingPreset) return

    try {
      const response = await fetch(`/api/pricing/presets/${editingPreset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setPresets(prev => prev.map(preset => 
          preset.id === editingPreset.id ? data.data : preset
        ))
        setEditingPreset(null)
        resetForm()
      } else {
        setError(data.message || 'Failed to update pricing preset')
      }
    } catch (err) {
      setError('Failed to update pricing preset')
    }
  }

  const handleToggleActive = async (preset: PricingPreset) => {
    try {
      const response = await fetch(`/api/pricing/presets/${preset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          ...preset,
          is_active: !preset.is_active
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPresets(prev => prev.map(p => 
          p.id === preset.id ? { ...p, is_active: !p.is_active } : p
        ))
      } else {
        setError(data.message || 'Failed to update pricing preset')
      }
    } catch (err) {
      setError('Failed to update pricing preset')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      academic_level: '',
      service_type: '',
      deadline_type: '',
      base_price_per_page: 0,
      multiplier: 1,
      is_active: true,
    })
  }

  const startEditing = (preset: PricingPreset) => {
    setEditingPreset(preset)
    setFormData({
      name: preset.name,
      academic_level: preset.academic_level,
      service_type: preset.service_type,
      deadline_type: preset.deadline_type,
      base_price_per_page: preset.base_price_per_page,
      multiplier: preset.multiplier,
      is_active: preset.is_active,
    })
    setIsCreating(false)
  }

  const startCreating = () => {
    setIsCreating(true)
    setEditingPreset(null)
    resetForm()
  }

  const cancelEdit = () => {
    setEditingPreset(null)
    setIsCreating(false)
    resetForm()
  }

  const calculateTotalPrice = (basePrice: number, multiplier: number, pages: number = 1) => {
    return (Number(basePrice) * Number(multiplier) * pages).toFixed(2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading pricing presets...</p>
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
          <h1 className="text-3xl font-bold">Pricing Management</h1>
          <p className="text-muted-foreground">
            Manage pricing presets for different academic levels and services
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPresets} variant="outline">
            Refresh
          </Button>
          <Button onClick={startCreating}>
            Add New Preset
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingPreset) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Create New Pricing Preset' : 'Edit Pricing Preset'}
            </CardTitle>
            <CardDescription>
              Set pricing for specific academic level, service type, and deadline combination
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isCreating ? handleCreatePreset : handleUpdatePreset} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Preset Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., College Essay - Standard"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academic_level">Academic Level</Label>
                  <Select
                    value={formData.academic_level}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, academic_level: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(academicLevels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(serviceTypes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline_type">Deadline Type</Label>
                  <Select
                    value={formData.deadline_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, deadline_type: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select deadline type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(deadlineTypes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_price_per_page">Base Price per Page ($)</Label>
                  <Input
                    id="base_price_per_page"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.base_price_per_page}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_price_per_page: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="multiplier">Multiplier</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={formData.multiplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, multiplier: parseFloat(e.target.value) || 1 }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              {/* Price Preview */}
              {formData.base_price_per_page > 0 && formData.multiplier > 0 && (
                <div className="p-4 rounded-md bg-muted/50">
                  <h4 className="font-medium mb-2">Price Preview</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">1 Page</div>
                      <div className="font-semibold">${calculateTotalPrice(formData.base_price_per_page, formData.multiplier, 1)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">5 Pages</div>
                      <div className="font-semibold">${calculateTotalPrice(formData.base_price_per_page, formData.multiplier, 5)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">10 Pages</div>
                      <div className="font-semibold">${calculateTotalPrice(formData.base_price_per_page, formData.multiplier, 10)}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {isCreating ? 'Create Preset' : 'Update Preset'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pricing Presets List */}
      <div className="space-y-4">
        {presets.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                No pricing presets found
              </div>
            </CardContent>
          </Card>
        ) : (
          presets.map((preset) => (
            <Card key={preset.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{preset.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        preset.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {preset.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Academic Level</div>
                        <div className="font-medium">
                          {academicLevels[preset.academic_level as keyof typeof academicLevels]}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Service Type</div>
                        <div className="font-medium">
                          {serviceTypes[preset.service_type as keyof typeof serviceTypes]}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Deadline Type</div>
                        <div className="font-medium">
                          {deadlineTypes[preset.deadline_type as keyof typeof deadlineTypes]}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Base Price</div>
                        <div className="font-medium">${Number(preset.base_price_per_page).toFixed(2)}/page</div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Multiplier</div>
                        <div className="font-medium">{Number(preset.multiplier).toFixed(2)}x</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">5 Pages Total</div>
                        <div className="font-medium text-lg">
                          ${calculateTotalPrice(preset.base_price_per_page, preset.multiplier, 5)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">10 Pages Total</div>
                        <div className="font-medium text-lg">
                          ${calculateTotalPrice(preset.base_price_per_page, preset.multiplier, 10)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(preset)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(preset)}
                    >
                      {preset.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
