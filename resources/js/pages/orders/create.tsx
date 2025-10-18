import { Head, usePage } from '@inertiajs/react'
import ClientLayout from '@/components/layouts/ClientLayout'
import { useState, useEffect, useMemo } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { NumberInput } from '@/components/ui/number-input'
import { FileUpload } from '@/components/ui/file-upload'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { 
  Info, 
  Shield, 
  Star, 
  Lock,
  CheckCircle
} from 'lucide-react'

interface CreateOrderPageProps {
  pricingOptions?: {
    academic_levels: Record<string, string>
    service_types: Record<string, string>
    deadline_types: Record<string, string>
    languages: Record<string, string>
  }
}

interface OrderFormData {
  service_type: string
  academic_level_id: string
  paper_type: string
  discipline_id: string
  topic: string
  description: string
  paper_format: string
  deadline_type_id: string
  deadline_date: string
  pages: number
  words: number
  spacing: string
  sources_count: number
  charts_count: number
  language_id: string
  [key: string]: string | number
}

interface PriceEstimate {
  total_price: number
  formatted_total_price: string
  price_breakdown: {
    base_price: number
    service_increment: number
    language_increment: number
    pages: number
    calculation: number
  }
}

export default function CreateOrderPage({ pricingOptions }: CreateOrderPageProps) {
  const { auth } = usePage<{ auth: { user: any } }>().props
  const [formData, setFormData] = useState<OrderFormData>({
    service_type: 'academic_writing',
    academic_level_id: '',
    paper_type: '',
    discipline_id: '',
    topic: 'Writer\'s choice',
    description: '',
    paper_format: 'APA',
    deadline_type_id: '',
    deadline_date: '',
    pages: 1,
    words: 275,
    spacing: 'double',
    sources_count: 0,
    charts_count: 0,
    language_id: '',
  })

  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null)
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Get deadline options based on selected academic level - memoized to prevent infinite loops
  const deadlineOptions = useMemo(() => {
    if (!formData.academic_level_id) return []
    
    // Always use database data if available
    if (pricingOptions?.deadline_types && Object.keys(pricingOptions.deadline_types).length > 0) {
      return Object.entries(pricingOptions.deadline_types).map(([value, label]) => ({
        value,
        label
      }))
    }
    
    // Fallback to predefined options if database data is not available
    const fallbackOptions = [
      { value: '1', label: '3 Days' },
      { value: '2', label: '2 Days' },
      { value: '3', label: '1 Day' },
      { value: '4', label: '12 Hours' },
      { value: '5', label: '6 Hours' },
      { value: '6', label: '3 Hours' },
    ]
    
    return fallbackOptions
  }, [formData.academic_level_id, pricingOptions?.deadline_types])

  // Calculate deadline date based on deadline type
  useEffect(() => {
    if (formData.deadline_type_id && formData.academic_level_id && deadlineOptions.length > 0) {
      const selectedOption = deadlineOptions.find(option => option.value === formData.deadline_type_id)
      
      if (selectedOption) {
        const deadlineDate = new Date()
        
        // Check if it's days or hours
        const daysMatch = selectedOption.label.match(/(\d+)\s*days?/i)
        const hoursMatch = selectedOption.label.match(/(\d+)\s*hours?/i)
        
        if (daysMatch) {
          // Handle days (e.g., "3 Days", "2 Days", "1 Day")
          const days = parseInt(daysMatch[1])
          deadlineDate.setDate(deadlineDate.getDate() + days)
        } else if (hoursMatch) {
          // Handle hours (e.g., "12 Hours", "6 Hours", "3 Hours")
          const hours = parseInt(hoursMatch[1])
          deadlineDate.setHours(deadlineDate.getHours() + hours)
        } else {
          // Default to 24 hours if no match
          deadlineDate.setHours(deadlineDate.getHours() + 24)
        }
        
        setFormData(prev => ({ ...prev, deadline_date: deadlineDate.toISOString().slice(0, 16) }))
      }
    }
  }, [formData.deadline_type_id, formData.academic_level_id, deadlineOptions])

  // Reset deadline selection when academic level changes
  useEffect(() => {
    if (formData.academic_level_id) {
      setFormData(prev => ({ ...prev, deadline_type_id: '' }))
    }
  }, [formData.academic_level_id])

  // Calculate price estimate when relevant fields change
  useEffect(() => {
    if (formData.academic_level_id && formData.discipline_id && formData.deadline_type_id && formData.language_id && formData.pages) {
      fetchPriceEstimate()
    }
  }, [formData.academic_level_id, formData.discipline_id, formData.deadline_type_id, formData.language_id, formData.pages])

  const fetchPriceEstimate = async () => {
    setIsLoadingEstimate(true)
    try {
      const response = await fetch(`/api/pricing/estimate?${new URLSearchParams({
        academic_level_id: formData.academic_level_id,
        service_type_id: formData.discipline_id, // This maps to service_type_id in backend
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
    setValidationError(null)
    
    // Validate required fields
    const missingFields = []
    if (!formData.topic.trim()) missingFields.push('Topic')
    if (!formData.academic_level_id || formData.academic_level_id === '') missingFields.push('Academic Level')
    if (!formData.discipline_id || formData.discipline_id === '') missingFields.push('Discipline')
    if (!formData.deadline_type_id || formData.deadline_type_id === '') missingFields.push('Deadline Type')
    if (!formData.language_id || formData.language_id === '') missingFields.push('Language')
    if (!formData.description.trim()) missingFields.push('Paper Instructions')
    
    if (missingFields.length > 0) {
      setValidationError(`Please fill in the following required fields: ${missingFields.join(', ')}`)
      return
    }
    
    // Prepare data for submission with correct field names
    const submitData = {
      ...formData,
      service_type_id: formData.discipline_id, // Map discipline_id to service_type_id for backend
      topic: formData.topic || 'Writer\'s choice', // Ensure topic has a default value
    }
    
    console.log('Submitting order with data:', submitData)
    setIsSubmitting(true)

    router.post('/orders', submitData, {
      onSuccess: () => {
        console.log('Order created successfully')
        setIsSubmitting(false)
      },
      onError: (errors) => {
        console.error('Order creation failed:', errors)
        setValidationError('Failed to create order. Please try again.')
        setIsSubmitting(false)
      },
      onFinish: () => setIsSubmitting(false),
    })
  }

  const serviceTypes = [
    { value: 'academic_writing', label: 'Academic writing' },
    { value: 'programming', label: 'Programming' },
    { value: 'calculations', label: 'Calculations' },
    { value: 'article_writing', label: 'Article Writing' },
  ]

  // Convert pricing options to academic levels format with fallback
  const academicLevels = pricingOptions?.academic_levels && Object.keys(pricingOptions.academic_levels).length > 0
    ? Object.entries(pricingOptions.academic_levels).map(([value, label]) => ({
        value,
        label: label.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
      }))
    : [
        { value: '1', label: 'High School' },
        { value: '2', label: 'Undergraduate' },
        { value: '3', label: 'Masters' },
        { value: '4', label: 'Ph.D' },
      ]

  const paperFormats = [
    { value: 'APA', label: 'APA' },
    { value: 'Chicago', label: 'Chicago / Turabian' },
    { value: 'MLA', label: 'MLA' },
    { value: 'Not applicable', label: 'Not applicable' },
    { value: 'Other', label: 'Other' },
  ]

  const spacingOptions = [
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
  ]

  return (
    <ClientLayout user={auth.user}>
      <Head title="Place Order" />
      
      <div className="container mx-auto py-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">PLACE AN ORDER</h1>
            <p className="text-gray-600 flex items-center gap-2">
              It's fast, secure, and confidential
              <Info className="h-4 w-4" />
            </p>
          </div>
          <Select defaultValue="USD">
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="EUR">€ EUR</SelectItem>
              <SelectItem value="GBP">£ GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Order Details
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Validation Error */}
              {validationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {validationError}
                </div>
              )}

              {/* Service Type */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Service Type</Label>
                <SegmentedControl
                  value={formData.service_type}
                  onValueChange={(value) => handleInputChange('service_type', value)}
                  options={serviceTypes}
                />
              </div>

              {/* Academic Level */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Academic level</Label>
                <SegmentedControl
                  value={formData.academic_level_id}
                  onValueChange={(value) => handleInputChange('academic_level_id', value)}
                  options={academicLevels}
                />
              </div>

              {/* Paper Type and Discipline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    Type of paper
                    <Info className="h-4 w-4 text-gray-500" />
                  </Label>
                  <Select value={formData.paper_type} onValueChange={(value) => handleInputChange('paper_type', value)}>
                    <SelectTrigger className="h-12 rounded-none border-gray-300">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="research_paper">Research Paper</SelectItem>
                      <SelectItem value="thesis">Thesis</SelectItem>
                      <SelectItem value="dissertation">Dissertation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-900">Discipline</Label>
                  <Select value={formData.discipline_id} onValueChange={(value) => handleInputChange('discipline_id', value)}>
                    <SelectTrigger className="h-12 rounded-none border-gray-300">
                      <SelectValue placeholder="Select or type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingOptions?.service_types && Object.entries(pricingOptions.service_types).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Topic */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Topic</Label>
                <Input
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  placeholder="Writer's choice"
                  className="h-12 rounded-none border-gray-300"
                />
              </div>

              {/* Paper Instructions */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Paper instructions</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Please provide detailed instructions for your paper. Include: What you want the writer to focus on, any specific requirements, class notes or textbook pages to reference, grading criteria, and any other important details to ensure you get exactly what you need."
                  rows={6}
                  className="rounded-none border-gray-300"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Attachments</Label>
                <FileUpload onFileSelect={() => {}} />
              </div>

              {/* Paper Format */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Paper format</Label>
                <SegmentedControl
                  value={formData.paper_format}
                  onValueChange={(value) => handleInputChange('paper_format', value)}
                  options={paperFormats}
                />
              </div>

              {/* Deadline */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Deadline</Label>
                <SegmentedControl
                  value={formData.deadline_type_id}
                  onValueChange={(value) => handleInputChange('deadline_type_id', value)}
                  options={deadlineOptions}
                />
                {formData.deadline_date && (
                  <p className="text-sm text-gray-600 mt-2">
                    We'll send you the order for review by {new Date(formData.deadline_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}.
                  </p>
                )}
              </div>

              {/* Pages and Spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-900">Pages</Label>
                  <NumberInput
                    value={formData.pages}
                    onChange={(value) => handleInputChange('pages', value)}
                    min={1}
                    max={100}
                  />
                  <p className="text-sm text-gray-600">{formData.words} words</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-900">Spacing</Label>
                  <SegmentedControl
                    value={formData.spacing}
                    onValueChange={(value) => handleInputChange('spacing', value)}
                    options={spacingOptions}
                  />
                </div>
              </div>

              {/* Sources and Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-900">Sources to be cited</Label>
                  <NumberInput
                    value={formData.sources_count}
                    onChange={(value) => handleInputChange('sources_count', value)}
                    min={0}
                    max={50}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold text-gray-900">Charts</Label>
                  <NumberInput
                    value={formData.charts_count}
                    onChange={(value) => handleInputChange('charts_count', value)}
                    min={0}
                    max={20}
                  />
                </div>
              </div>

              {/* Language */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Language</Label>
                <Select value={formData.language_id} onValueChange={(value) => handleInputChange('language_id', value)}>
                  <SelectTrigger className="h-12 rounded-none border-gray-300">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingOptions?.languages && Object.entries(pricingOptions.languages).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Features */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Additional Features (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="plagiarism_report" className="rounded" />
                    <label htmlFor="plagiarism_report" className="text-sm font-medium text-gray-700">
                      Plagiarism Report (+$15.00)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="priority_support" className="rounded" />
                    <label htmlFor="priority_support" className="text-sm font-medium text-gray-700">
                      Priority Support (+$25.00)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="unlimited_revisions" className="rounded" />
                    <label htmlFor="unlimited_revisions" className="text-sm font-medium text-gray-700">
                      Unlimited Revisions (+20%)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="progressive_delivery" className="rounded" />
                    <label htmlFor="progressive_delivery" className="text-sm font-medium text-gray-700">
                      Progressive Delivery (+$10.00)
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="top_writer" className="rounded" />
                    <label htmlFor="top_writer" className="text-sm font-medium text-gray-700">
                      Top Writer (+30%)
                    </label>
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Details */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">{formData.topic}</div>
                  <div className="text-sm text-gray-600">
                    {academicLevels.find(level => level.value === formData.academic_level_id)?.label || 'Select level'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {deadlineOptions.find(option => option.value === formData.deadline_type_id)?.label || 'Select deadline'}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{formData.pages} page{formData.pages > 1 ? 's' : ''} x ${priceEstimate?.price_breakdown?.base_price?.toFixed(2) || '12.00'}</span>
                    <span className="font-medium">{priceEstimate?.formatted_total_price || '$0.00'}</span>
                  </div>
                </div>

                {/* Total Price */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total price</span>
                    <span className="text-2xl font-bold text-green-600">
                      {priceEstimate?.formatted_total_price || '$0.00'}
                    </span>
                  </div>
                  {isLoadingEstimate && <Spinner className="w-4 h-4" />}
                  <p className="text-xs text-gray-600 mt-1">
                    Note: VAT may be charged upon checkout for EU citizens.
                  </p>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Select payment method</Label>
                  <Select defaultValue="paypal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="stripe">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Safe Checkout Button */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-none"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !priceEstimate}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Safe checkout
                </Button>

                {/* Reviews */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium">Excellent</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-green-500 text-green-500" />
                      ))}
                    </div>
                    <span className="text-sm font-medium">4.7</span>
                  </div>
                  <p className="text-sm text-gray-600">Based on 2,024 reviews</p>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                    <span className="text-sm text-green-600 font-medium">Trustpilot</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}