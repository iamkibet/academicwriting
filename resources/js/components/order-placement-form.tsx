import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertError } from '@/components/alert-error'
import { Spinner } from '@/components/ui/spinner'

interface OrderFormData {
  title: string
  description: string
  academic_level_id: string
  service_type_id: string
  deadline_type_id: string
  language_id: string
  deadline_date: string
  pages: number
  words: number
  client_notes: string
}

interface PriceEstimate {
  total_price: number
  formatted_total_price: string
  price_breakdown: {
    base_price: number
    multiplier: number
    pages: number
    calculation: number
  }
}

interface OrderPlacementFormProps {
  pricingOptions?: {
    academic_levels: Record<string, string>
    service_types: Record<string, string>
    deadline_types: Record<string, string>
    languages: Record<string, string>
  }
  errors?: Record<string, string>
}

export function OrderPlacementForm({ pricingOptions, errors }: OrderPlacementFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    title: '',
    description: '',
    academic_level_id: '',
    service_type_id: '',
    deadline_type_id: '',
    language_id: '',
    deadline_date: '',
    pages: 1,
    words: 250,
    client_notes: '',
  })

  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null)
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate price estimate when relevant fields change
  useEffect(() => {
    if (formData.academic_level_id && formData.service_type_id && formData.deadline_type_id && formData.pages) {
      fetchPriceEstimate()
    }
  }, [formData.academic_level_id, formData.service_type_id, formData.deadline_type_id, formData.pages])

  const fetchPriceEstimate = async () => {
    setIsLoadingEstimate(true)
    try {
      const response = await fetch(`/api/pricing/estimate?${new URLSearchParams({
        academic_level_id: formData.academic_level_id,
        service_type_id: formData.service_type_id,
        deadline_type_id: formData.deadline_type_id,
        language_id: formData.language_id,
        pages: formData.pages.toString(),
      })}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      })
      
      if (response.ok) {
        const data = await response.json()
        setPriceEstimate(data.data)
      } else {
        console.warn('Price estimate failed:', response.status)
      }
    } catch (error) {
      console.error('Failed to fetch price estimate:', error)
    } finally {
      setIsLoadingEstimate(false)
    }
  }

  const handleInputChange = (field: keyof OrderFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    router.post('/orders', formData, {
      onFinish: () => setIsSubmitting(false),
    })
  }

  const defaultPricingOptions = {
    academic_levels: {
      high_school: 'High School',
      college: 'College',
      graduate: 'Graduate',
      phd: 'PhD',
    },
    service_types: {
      essay: 'Essay',
      research_paper: 'Research Paper',
      thesis: 'Thesis',
      dissertation: 'Dissertation',
    },
    deadline_types: {
      standard: 'Standard (7+ days)',
      rush: 'Rush (3-6 days)',
      ultra_rush: 'Ultra Rush (1-2 days)',
    },
    languages: {
      english: 'English',
      spanish: 'Spanish',
      french: 'French',
      german: 'German',
    },
  }

  const options = pricingOptions || defaultPricingOptions

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Place New Order</CardTitle>
          <CardDescription>
            Fill out the form below to place your academic writing order. 
            All fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AlertError errors={errors} />

            {/* Order Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Order Title *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a descriptive title for your order"
                required
              />
            </div>

            {/* Order Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Order Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed instructions for your academic paper. Include topic, requirements, formatting guidelines, and any specific instructions."
                rows={6}
                required
              />
              <p className="text-sm text-muted-foreground">
                Minimum 50 characters. Be as detailed as possible to ensure accurate work.
              </p>
            </div>

            {/* Academic Level and Service Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academic_level_id">
                  Academic Level *
                </Label>
                <Select
                  value={formData.academic_level_id}
                  onValueChange={(value) => handleInputChange('academic_level_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(options.academic_levels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_type_id">
                  Service Type *
                </Label>
                <Select
                  value={formData.service_type_id}
                  onValueChange={(value) => handleInputChange('service_type_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(options.service_types).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language_id">
                Language *
              </Label>
              <Select
                value={formData.language_id}
                onValueChange={(value) => handleInputChange('language_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(options.languages).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Deadline Type and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline_type_id">
                  Deadline Type *
                </Label>
                <Select
                  value={formData.deadline_type_id}
                  onValueChange={(value) => handleInputChange('deadline_type_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deadline type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(options.deadline_types).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline_date">
                  Deadline Date *
                </Label>
                <Input
                  id="deadline_date"
                  type="datetime-local"
                  value={formData.deadline_date}
                  onChange={(e) => handleInputChange('deadline_date', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            </div>

            {/* Pages and Words */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pages">
                  Number of Pages *
                </Label>
                <Input
                  id="pages"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.pages}
                  onChange={(e) => handleInputChange('pages', parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="words">
                  Number of Words *
                </Label>
                <Input
                  id="words"
                  type="number"
                  min="250"
                  value={formData.words}
                  onChange={(e) => handleInputChange('words', parseInt(e.target.value) || 250)}
                  required
                />
              </div>
            </div>

            {/* Client Notes */}
            <div className="space-y-2">
              <Label htmlFor="client_notes">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="client_notes"
                value={formData.client_notes}
                onChange={(e) => handleInputChange('client_notes', e.target.value)}
                placeholder="Any additional instructions, preferences, or requirements..."
                rows={3}
              />
            </div>

            {/* Price Estimate */}
            {priceEstimate && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Price Estimate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {priceEstimate.formatted_total_price}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {priceEstimate.price_breakdown.pages} pages × ${Number(priceEstimate.price_breakdown.base_price).toFixed(2)} × {Number(priceEstimate.price_breakdown.multiplier).toFixed(2)}
                      </p>
                    </div>
                    {isLoadingEstimate && (
                      <Spinner className="w-6 h-6" />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting || !priceEstimate}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
