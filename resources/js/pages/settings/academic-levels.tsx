import { Head } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertError } from '@/components/alert-error'
import { router, useForm } from '@inertiajs/react'
import { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  GraduationCap,
  Clock,
  DollarSign,
  ArrowLeft,
  Settings
} from 'lucide-react'

interface AcademicLevel {
  id: number
  level: string
  is_active: boolean
  active_rates: AcademicRate[]
}

interface AcademicRate {
  id: number
  hours: number
  label: string
  cost: string
  deleted: boolean
}

interface AcademicLevelsPageProps {
  academicLevels: AcademicLevel[]
  errors?: Record<string, string>
}

export default function AcademicLevelsPage({ academicLevels, errors }: AcademicLevelsPageProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [editingLevel, setEditingLevel] = useState<AcademicLevel | null>(null)
  const [editingRate, setEditingRate] = useState<AcademicRate | null>(null)
  const [activeRateForm, setActiveRateForm] = useState<number | null>(null)

  const { data: createData, setData: setCreateData, post: createPost, processing: creating } = useForm({
    level: '',
  })

  const { data: editData, setData: setEditData, patch: editPatch, processing: editing } = useForm({
    level: '',
  })

  const { data: rateData, setData: setRateData, post: ratePost, processing: rateCreating } = useForm({
    hours: '',
    label: '',
    cost: '',
  })

  const { data: adjustData, setData: setAdjustData, post: adjustPost, processing: adjusting } = useForm({
    type: 'percent',
    amount: '',
  })

  const handleCreateLevel = (e: React.FormEvent) => {
    e.preventDefault()
    createPost('/settings/academic-levels', {
      onSuccess: () => {
        setIsCreating(false)
        setCreateData({ level: '' })
      }
    })
  }

  const handleEditLevel = (level: AcademicLevel) => {
    setEditingLevel(level)
    setEditData({ level: level.level })
  }

  const handleUpdateLevel = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingLevel) {
      editPatch(`/settings/academic-levels/${editingLevel.id}`, {
        onSuccess: () => {
          setEditingLevel(null)
          setEditData({ level: '' })
        }
      })
    }
  }

  const handleDeleteLevel = (level: AcademicLevel) => {
    if (confirm('Are you sure you want to delete this academic level?')) {
      router.delete(`/settings/academic-levels/${level.id}`)
    }
  }

  const handleCreateRate = (levelId: number) => {
    ratePost(`/settings/academic-levels/${levelId}/rates`, {
      onSuccess: () => {
        setActiveRateForm(null)
        setRateData({ hours: '', label: '', cost: '' })
      }
    })
  }

  const handleEditRate = (rate: AcademicRate, levelId: number) => {
    setEditingRate(rate)
    setRateData({ hours: rate.hours.toString(), label: rate.label, cost: rate.cost })
    setActiveRateForm(levelId)
  }

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRate) {
      router.patch(`/settings/academic-rates/${editingRate.id}`, rateData, {
        onSuccess: () => {
          setEditingRate(null)
          setActiveRateForm(null)
          setRateData({ hours: '', label: '', cost: '' })
        }
      })
    }
  }

  const handleDeleteRate = (rate: AcademicRate) => {
    if (confirm('Are you sure you want to delete this rate?')) {
      router.delete(`/settings/academic-rates/${rate.id}`)
    }
  }

  const handleAdjustAllRates = (e: React.FormEvent) => {
    e.preventDefault()
    adjustPost('/settings/academic-levels/adjust-all', {
      onSuccess: () => {
        setIsAdjusting(false)
        setAdjustData({ type: 'percent', amount: '' })
      }
    })
  }

  return (
    <AppLayout>
      <Head title="Academic Levels Settings" />
      
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.visit('/settings')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            Academic Levels
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage academic levels and their associated rates
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Academic Level
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Academic Level</DialogTitle>
                <DialogDescription>
                  Create a new academic level for pricing.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLevel}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="level">Level Name</Label>
                    <Input
                      id="level"
                      value={createData.level}
                      onChange={(e) => setCreateData('level', e.target.value)}
                      placeholder="e.g., High School, Undergraduate, Masters"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAdjusting} onOpenChange={setIsAdjusting}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Adjust All Rates
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust All Rates</DialogTitle>
                <DialogDescription>
                  Apply a percentage or fixed amount adjustment to all rates.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdjustAllRates}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Adjustment Type</Label>
                    <select
                      id="type"
                      value={adjustData.type}
                      onChange={(e) => setAdjustData('type', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="money">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={adjustData.amount}
                      onChange={(e) => setAdjustData('amount', e.target.value)}
                      placeholder={adjustData.type === 'percent' ? '10' : '5.00'}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAdjusting(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={adjusting}>
                    {adjusting ? 'Adjusting...' : 'Adjust Rates'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {errors && <AlertError errors={errors} />}

        <div className="space-y-6">
          {academicLevels.map((level) => (
            <Card key={level.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{level.level}</CardTitle>
                    <CardDescription>
                      {level.active_rates.length} rate(s) configured
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditLevel(level)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveRateForm(level.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLevel(level)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {level.active_rates.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-4 py-2 text-left">#</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Hours</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Label</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Cost</th>
                            <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {level.active_rates.map((rate, index) => (
                            <tr key={rate.id}>
                              <td className="border border-gray-200 px-4 py-2">{index + 1}</td>
                              <td className="border border-gray-200 px-4 py-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  {rate.hours}
                                </div>
                              </td>
                              <td className="border border-gray-200 px-4 py-2">{rate.label}</td>
                              <td className="border border-gray-200 px-4 py-2">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-green-500" />
                                  ${Number(rate.cost).toFixed(2)}
                                </div>
                              </td>
                              <td className="border border-gray-200 px-4 py-2">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRate(rate, level.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRate(rate)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No rates configured for this academic level.
                    </div>
                  )}

                  {activeRateForm === level.id && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {editingRate ? 'Edit Rate' : 'Add New Rate'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={(e) => {
                          e.preventDefault()
                          if (editingRate) {
                            handleUpdateRate(e)
                          } else {
                            handleCreateRate(level.id)
                          }
                        }}>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="hours">Hours</Label>
                              <Input
                                id="hours"
                                type="number"
                                value={rateData.hours}
                                onChange={(e) => setRateData('hours', e.target.value)}
                                placeholder="24"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="label">Label</Label>
                              <Input
                                id="label"
                                value={rateData.label}
                                onChange={(e) => setRateData('label', e.target.value)}
                                placeholder="Standard"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cost">Cost</Label>
                              <Input
                                id="cost"
                                type="number"
                                step="0.01"
                                value={rateData.cost}
                                onChange={(e) => setRateData('cost', e.target.value)}
                                placeholder="10.00"
                                required
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button type="submit" disabled={rateCreating}>
                              {rateCreating ? 'Saving...' : (editingRate ? 'Update' : 'Add')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setActiveRateForm(null)
                                setEditingRate(null)
                                setRateData({ hours: '', label: '', cost: '' })
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Level Dialog */}
        <Dialog open={!!editingLevel} onOpenChange={(open) => !open && setEditingLevel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Academic Level</DialogTitle>
              <DialogDescription>
                Update the academic level name.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateLevel}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-level">Level Name</Label>
                  <Input
                    id="edit-level"
                    value={editData.level}
                    onChange={(e) => setEditData('level', e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingLevel(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={editing}>
                  {editing ? 'Updating...' : 'Update'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
