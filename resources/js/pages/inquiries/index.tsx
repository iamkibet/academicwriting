import { Head, Link, usePage, router } from '@inertiajs/react'
import ClientLayout from '@/components/layouts/ClientLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react'

interface Inquiry {
  id: number
  title: string
  status: string
  estimated_price: number | null
  created_at: string
  pages: number
  academic_level?: { name: string }
  service_type?: { name: string }
}

interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

interface InquiriesPageProps {
  inquiries: {
    data: Inquiry[]
    links: PaginationLink[]
    current_page: number
    last_page: number
  }
  filter: string
}

export default function InquiriesIndex({ inquiries, filter }: InquiriesPageProps) {
  const { auth } = usePage<{ auth: { user: any } }>().props

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">Draft</Badge>
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">Submitted</Badge>
      case 'converted':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">Converted</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleDelete = (inquiry: Inquiry) => {
    if (confirm('Are you sure you want to delete this inquiry?')) {
      router.delete(`/dashboard/inquiries/${inquiry.id}`)
    }
  }

  return (
    <ClientLayout user={auth.user}>
      <Head title="Free Inquiries" />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Free Inquiries</h1>
              <p className="text-lg text-gray-600">Manage your free project inquiries</p>
            </div>
            <Link href="/dashboard/inquiries/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Inquiry
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <Link
              href="/dashboard/inquiries?status=all"
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-[#05ADA3] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </Link>
            <Link
              href="/dashboard/inquiries?status=draft"
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'draft'
                  ? 'bg-[#05ADA3] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Drafts
            </Link>
            <Link
              href="/dashboard/inquiries?status=submitted"
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'submitted'
                  ? 'bg-[#05ADA3] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Submitted
            </Link>
            <Link
              href="/dashboard/inquiries?status=converted"
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'converted'
                  ? 'bg-[#05ADA3] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Converted
            </Link>
          </div>

          {/* Inquiries List */}
          {inquiries.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No inquiries yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first free inquiry</p>
                <Link href="/dashboard/inquiries/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Inquiry
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {inquiries.data.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {inquiry.title}
                          {getStatusBadge(inquiry.status)}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {inquiry.pages} pages • {inquiry.academic_level?.name || 'N/A'} • {inquiry.service_type?.name || 'N/A'}
                          {inquiry.estimated_price && ` • $${inquiry.estimated_price.toFixed(2)}`}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/dashboard/inquiries/${inquiry.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        {inquiry.status === 'draft' && (
                          <>
                            <Link href={`/dashboard/inquiries/${inquiry.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" onClick={() => handleDelete(inquiry)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                        {inquiry.status === 'draft' || inquiry.status === 'submitted' ? (
                          <form onSubmit={(e) => {
                            e.preventDefault()
                            router.post(`/dashboard/inquiries/${inquiry.id}/convert-to-order`)
                          }}>
                            <Button type="submit" size="sm">
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Convert to Order
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {/* Pagination */}
              {inquiries.links.length > 3 && (
                <div className="flex justify-center gap-2">
                  {inquiries.links.map((link, index) => (
                    link.url ? (
                      <Link
                        key={index}
                        href={link.url}
                        className={`px-4 py-2 rounded-lg ${
                          link.active
                            ? 'bg-[#05ADA3] text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                      </Link>
                    ) : (
                      <span key={index} className="px-4 py-2 text-gray-400">
                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                      </span>
                    )
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  )
}
