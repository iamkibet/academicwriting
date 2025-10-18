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
  Languages as LanguagesIcon,
  ArrowLeft,
  DollarSign,
  Percent
} from 'lucide-react'

interface Language {
  id: number
  label: string
  inc_type: 'percent' | 'money'
  amount: string
  is_active: boolean
}

interface LanguagesPageProps {
  languages: Language[]
  errors?: Record<string, string>
}

export default function LanguagesPage({ languages, errors }: LanguagesPageProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null)

  const { data: createData, setData: setCreateData, post: createPost, processing: creating } = useForm({
    label: '',
    inc_type: 'percent' as 'percent' | 'money',
    amount: '',
  })

  const { data: editData, setData: setEditData, patch: editPatch, processing: editing } = useForm({
    label: '',
    inc_type: 'percent' as 'percent' | 'money',
    amount: '',
  })

  const handleCreateLanguage = (e: React.FormEvent) => {
    e.preventDefault()
    createPost('/settings/languages', {
      onSuccess: () => {
        setIsCreating(false)
        setCreateData({ label: '', inc_type: 'percent', amount: '' })
      }
    })
  }

  const handleEditLanguage = (language: Language) => {
    setEditingLanguage(language)
    setEditData({ 
      label: language.label, 
      inc_type: language.inc_type, 
      amount: language.amount 
    })
  }

  const handleUpdateLanguage = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingLanguage) {
      editPatch(`/settings/languages/${editingLanguage.id}`, {
        onSuccess: () => {
          setEditingLanguage(null)
          setEditData({ label: '', inc_type: 'percent', amount: '' })
        }
      })
    }
  }

  const handleDeleteLanguage = (language: Language) => {
    if (confirm('Are you sure you want to delete this language?')) {
      router.delete(`/settings/languages/${language.id}`)
    }
  }

  return (
    <AppLayout>
      <Head title="Languages Settings" />
      
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
            <LanguagesIcon className="h-8 w-8" />
            Languages
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage language categories and their pricing increments
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Language</DialogTitle>
                <DialogDescription>
                  Create a new language category with pricing increment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateLanguage}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="label">Language Label</Label>
                    <Input
                      id="label"
                      value={createData.label}
                      onChange={(e) => setCreateData('label', e.target.value)}
                      placeholder="e.g., English, Spanish, French"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="inc_type">Increment Type</Label>
                    <select
                      id="inc_type"
                      value={createData.inc_type}
                      onChange={(e) => setCreateData('inc_type', e.target.value as 'percent' | 'money')}
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
                      step="0.01"
                      value={createData.amount}
                      onChange={(e) => setCreateData('amount', e.target.value)}
                      placeholder={createData.inc_type === 'percent' ? '10' : '5.00'}
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
        </div>

        {errors && <AlertError errors={errors} />}

        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>
              Manage language categories and their pricing increments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">ID</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Label</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Inc. Type</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Amount</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {languages.map((language) => (
                    <tr key={language.id}>
                      <td className="border border-gray-200 px-4 py-2">{language.id}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <LanguagesIcon className="h-4 w-4 text-gray-500" />
                          {language.label}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-2">
                          {language.inc_type === 'percent' ? (
                            <Percent className="h-4 w-4 text-blue-500" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-green-500" />
                          )}
                          <span className="capitalize">{language.inc_type}</span>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-1">
                          {language.inc_type === 'percent' ? (
                            <>
                              <Percent className="h-4 w-4 text-blue-500" />
                              {language.amount}%
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-green-500" />
                              ${Number(language.amount).toFixed(2)}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLanguage(language)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteLanguage(language)}
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

            {languages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No languages configured yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Language Dialog */}
        <Dialog open={!!editingLanguage} onOpenChange={(open) => !open && setEditingLanguage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Language</DialogTitle>
              <DialogDescription>
                Update the language information and pricing increment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateLanguage}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-label">Language Label</Label>
                  <Input
                    id="edit-label"
                    value={editData.label}
                    onChange={(e) => setEditData('label', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-inc_type">Increment Type</Label>
                  <select
                    id="edit-inc_type"
                    value={editData.inc_type}
                    onChange={(e) => setEditData('inc_type', e.target.value as 'percent' | 'money')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="money">Fixed Amount ($)</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">Amount</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editData.amount}
                    onChange={(e) => setEditData('amount', e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingLanguage(null)}>
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
