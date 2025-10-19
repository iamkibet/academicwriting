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
  BookOpen,
  ArrowLeft,
  DollarSign,
  Percent
} from 'lucide-react'

interface Subject {
  id: number
  name: string
  slug: string
  description: string
  is_active: boolean
}

interface SubjectsPageProps {
  subjects: Subject[]
  errors?: Record<string, string>
}

export default function SubjectsPage({ subjects, errors }: SubjectsPageProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  const { data: createData, setData: setCreateData, post: createPost, processing: creating } = useForm({
    name: '',
    slug: '',
    description: '',
  })

  const { data: editData, setData: setEditData, patch: editPatch, processing: editing } = useForm({
    name: '',
    slug: '',
    description: '',
  })

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault()
    createPost('/settings/subjects', {
      onSuccess: () => {
        setIsCreating(false)
        setCreateData({ name: '', slug: '', description: '' })
      }
    })
  }

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject)
    setEditData({ 
      name: subject.name, 
      slug: subject.slug, 
      description: subject.description 
    })
  }

  const handleUpdateSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSubject) {
      editPatch(`/settings/subjects/${editingSubject.id}`, {
        onSuccess: () => {
          setEditingSubject(null)
          setEditData({ name: '', slug: '', description: '' })
        }
      })
    }
  }

  const handleDeleteSubject = (subject: Subject) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      router.delete(`/settings/subjects/${subject.id}`)
    }
  }

  return (
    <AppLayout>
      <Head title="Subjects Settings" />
      
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
            <BookOpen className="h-8 w-8" />
            Subjects
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage subject categories and their pricing increments
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subject</DialogTitle>
                <DialogDescription>
                  Create a new subject category with pricing increment.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubject}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Subject Name</Label>
                    <Input
                      id="name"
                      value={createData.name}
                      onChange={(e) => setCreateData('name', e.target.value)}
                      placeholder="e.g., Mathematics, Science, Literature"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={createData.slug}
                      onChange={(e) => setCreateData('slug', e.target.value)}
                      placeholder="e.g., mathematics, science, literature"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={createData.description}
                      onChange={(e) => setCreateData('description', e.target.value)}
                      placeholder="Brief description of this subject"
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
            <CardTitle>Subjects</CardTitle>
            <CardDescription>
              Manage subject categories and their pricing increments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">ID</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Slug</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Description</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td className="border border-gray-200 px-4 py-2">{subject.id}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          {subject.name}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {subject.slug}
                        </code>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <span className="text-sm text-gray-600">
                          {subject.description || 'No description'}
                        </span>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSubject(subject)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubject(subject)}
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

            {subjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No subjects configured yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Subject Dialog */}
        <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>
                Update the subject information and pricing increment.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateSubject}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Subject Name</Label>
                  <Input
                    id="edit-name"
                    value={editData.name}
                    onChange={(e) => setEditData('name', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input
                    id="edit-slug"
                    value={editData.slug}
                    onChange={(e) => setEditData('slug', e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editData.description}
                    onChange={(e) => setEditData('description', e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingSubject(null)}>
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
