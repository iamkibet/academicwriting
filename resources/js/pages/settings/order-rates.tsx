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
  Clock,
  ArrowLeft,
  DollarSign,
  GraduationCap,
  User,
  Award,
  BookOpen
} from 'lucide-react'

interface OrderRate {
  id: number
  hours: number
  label: string
  high_school: string
  under_graduate: string
  masters: string
  phd: string
  is_active: boolean
}

interface OrderRatesPageProps {
  orderRates: OrderRate[]
  errors?: Record<string, string>
}

export default function OrderRatesPage({ orderRates, errors }: OrderRatesPageProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingRate, setEditingRate] = useState<OrderRate | null>(null)

  const { data: createData, setData: setCreateData, post: createPost, processing: creating } = useForm({
    hours: '',
    label: '',
    high_school: '',
    under_graduate: '',
    masters: '',
    phd: '',
  })

  const { data: editData, setData: setEditData, patch: editPatch, processing: editing } = useForm({
    hours: '',
    label: '',
    high_school: '',
    under_graduate: '',
    masters: '',
    phd: '',
  })

  const handleCreateRate = (e: React.FormEvent) => {
    e.preventDefault()
    createPost('/settings/order-rates', {
      onSuccess: () => {
        setIsCreating(false)
        setCreateData({ hours: '', label: '', high_school: '', under_graduate: '', masters: '', phd: '' })
      }
    })
  }

  const handleEditRate = (rate: OrderRate) => {
    setEditingRate(rate)
    setEditData({ 
      hours: rate.hours.toString(), 
      label: rate.label, 
      high_school: rate.high_school, 
      under_graduate: rate.under_graduate, 
      masters: rate.masters, 
      phd: rate.phd 
    })
  }

  const handleUpdateRate = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingRate) {
      editPatch(`/settings/order-rates/${editingRate.id}`, {
        onSuccess: () => {
          setEditingRate(null)
          setEditData({ hours: '', label: '', high_school: '', under_graduate: '', masters: '', phd: '' })
        }
      })
    }
  }

  const handleDeleteRate = (rate: OrderRate) => {
    if (confirm('Are you sure you want to delete this order rate?')) {
      router.delete(`/settings/order-rates/${rate.id}`)
    }
  }

  return (
    <AppLayout>
      <Head title="Order Rates Settings" />
      
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
            <Clock className="h-8 w-8" />
            Order Rates
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage urgency rates for different academic levels
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Order Rate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Order Rate</DialogTitle>
                <DialogDescription>
                  Create a new urgency rate for different academic levels.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRate}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="hours">Hours</Label>
                      <Input
                        id="hours"
                        type="number"
                        value={createData.hours}
                        onChange={(e) => setCreateData('hours', e.target.value)}
                        placeholder="24"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="label">Label</Label>
                      <Input
                        id="label"
                        value={createData.label}
                        onChange={(e) => setCreateData('label', e.target.value)}
                        placeholder="Standard"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="high_school" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        High School
                      </Label>
                      <Input
                        id="high_school"
                        type="number"
                        step="0.01"
                        value={createData.high_school}
                        onChange={(e) => setCreateData('high_school', e.target.value)}
                        placeholder="8.00"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="under_graduate" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Undergraduate
                      </Label>
                      <Input
                        id="under_graduate"
                        type="number"
                        step="0.01"
                        value={createData.under_graduate}
                        onChange={(e) => setCreateData('under_graduate', e.target.value)}
                        placeholder="12.00"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="masters" className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Masters
                      </Label>
                      <Input
                        id="masters"
                        type="number"
                        step="0.01"
                        value={createData.masters}
                        onChange={(e) => setCreateData('masters', e.target.value)}
                        placeholder="18.00"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phd" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Ph.D
                      </Label>
                      <Input
                        id="phd"
                        type="number"
                        step="0.01"
                        value={createData.phd}
                        onChange={(e) => setCreateData('phd', e.target.value)}
                        placeholder="24.00"
                        required
                      />
                    </div>
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
        </div>

        {errors && <AlertError errors={errors} />}

        <Card>
          <CardHeader>
            <CardTitle>Order Rates</CardTitle>
            <CardDescription>
              Manage urgency rates for different academic levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">ID</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Hours</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Label</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        High School
                      </div>
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        Undergraduate
                      </div>
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Masters
                      </div>
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Ph.D
                      </div>
                    </th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRates.map((rate) => (
                    <tr key={rate.id}>
                      <td className="border border-gray-200 px-4 py-2">{rate.id}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {rate.hours}h
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">{rate.label}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          ${Number(rate.high_school).toFixed(2)}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          ${Number(rate.under_graduate).toFixed(2)}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          ${Number(rate.masters).toFixed(2)}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          ${Number(rate.phd).toFixed(2)}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditRate(rate)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRate(rate)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orderRates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No order rates configured yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Order Rate Dialog */}
        <Dialog open={!!editingRate} onOpenChange={(open) => !open && setEditingRate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Order Rate</DialogTitle>
              <DialogDescription>
                Update the urgency rate for different academic levels.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateRate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-hours">Hours</Label>
                    <Input
                      id="edit-hours"
                      type="number"
                      value={editData.hours}
                      onChange={(e) => setEditData('hours', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-label">Label</Label>
                    <Input
                      id="edit-label"
                      value={editData.label}
                      onChange={(e) => setEditData('label', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-high_school" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      High School
                    </Label>
                    <Input
                      id="edit-high_school"
                      type="number"
                      step="0.01"
                      value={editData.high_school}
                      onChange={(e) => setEditData('high_school', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-under_graduate" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Undergraduate
                    </Label>
                    <Input
                      id="edit-under_graduate"
                      type="number"
                      step="0.01"
                      value={editData.under_graduate}
                      onChange={(e) => setEditData('under_graduate', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-masters" className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Masters
                    </Label>
                    <Input
                      id="edit-masters"
                      type="number"
                      step="0.01"
                      value={editData.masters}
                      onChange={(e) => setEditData('masters', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-phd" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Ph.D
                    </Label>
                    <Input
                      id="edit-phd"
                      type="number"
                      step="0.01"
                      value={editData.phd}
                      onChange={(e) => setEditData('phd', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingRate(null)}>
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
