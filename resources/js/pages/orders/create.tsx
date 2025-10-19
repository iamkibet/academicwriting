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

// Loading Dots Component
const LoadingDots = () => (
  <div className="flex items-center gap-1">
    <div 
      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" 
      style={{ 
        animationDelay: '0ms',
        animationDuration: '1.4s'
      }}
    ></div>
    <div 
      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" 
      style={{ 
        animationDelay: '200ms',
        animationDuration: '1.4s'
      }}
    ></div>
    <div 
      className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" 
      style={{ 
        animationDelay: '400ms',
        animationDuration: '1.4s'
      }}
    ></div>
  </div>
)

interface CreateOrderPageProps {
  pricingOptions?: {
    academic_levels: Record<string, string>
    service_types: Record<string, string>
    deadline_types: Record<string, string>
    languages: Record<string, string>
    additional_features: Record<string, {
      id: number
      name: string
      description: string | null
      type: 'percent' | 'fixed'
      amount: number
      price_display: string
    }>
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
  additional_features: string[]
  [key: string]: string | number | string[]
}

interface PriceEstimate {
  total_price: number
  formatted_total_price: string
  price_breakdown: {
    base_price: number
    service_increment: number
    language_increment: number
    pages: number
    additional_features_cost: number
    calculation: number
  }
}

export default function CreateOrderPage({ pricingOptions }: CreateOrderPageProps) {
  const { auth } = usePage<{ auth: { user: any } }>().props
  const [formData, setFormData] = useState<OrderFormData>({
    service_type: 'academic_writing',
    academic_level_id: '5', // Default to High School
    paper_type: '',
    discipline_id: '1', // Default to first service type
    topic: 'Writer\'s choice',
    description: '',
    paper_format: 'APA',
    deadline_type_id: '', // Will be set to 7 Days from admin settings
    deadline_date: '',
    pages: 1,
    words: 250, // Default for double spacing (1 page = 250 words)
    spacing: 'double',
    sources_count: 0,
    charts_count: 0,
    language_id: '1', // Default to English
    additional_features: [], // Array of selected additional features
  })

  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null)
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [loadingFields, setLoadingFields] = useState<Set<string>>(new Set())
  const [recentlyUpdatedFields, setRecentlyUpdatedFields] = useState<Set<string>>(new Set())
  const [isFormReady, setIsFormReady] = useState(false)
  const [isUserSubmitted, setIsUserSubmitted] = useState(false)

  // Helper function to convert deadline label to hours for sorting
  const getHoursFromLabel = (label: string): number => {
    const hoursMatch = label.match(/(\d+)\s*hours?/i)
    const daysMatch = label.match(/(\d+)\s*days?/i)
    
    if (hoursMatch) {
      return parseInt(hoursMatch[1])
    } else if (daysMatch) {
      return parseInt(daysMatch[1]) * 24
    }
    return 0
  }

  // Get deadline options for the selected academic level
  const [deadlineOptions, setDeadlineOptions] = useState<Array<{value: string, label: string, displayLabel: string}>>([])

  // Fetch deadline options when academic level changes
  useEffect(() => {
    if (formData.academic_level_id) {
      fetchDeadlineOptions(formData.academic_level_id)
    }
  }, [formData.academic_level_id])

  // Check if form is ready for submission
  useEffect(() => {
    const isReady = !!(
      formData.academic_level_id && 
      formData.deadline_type_id && 
      formData.discipline_id && 
      formData.language_id &&
      formData.pages > 0
    )
    setIsFormReady(isReady)
  }, [formData.academic_level_id, formData.deadline_type_id, formData.discipline_id, formData.language_id, formData.pages])

  const fetchDeadlineOptions = async (academicLevelId: string) => {
    try {
      const response = await fetch(`/api/pricing/options?academic_level_id=${academicLevelId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      })
      
      if (response.ok) {
        const data = await response.json()
        const deadlineTypes = data.data.deadline_types || {}
        
        // Convert to array and sort by hours
        const options = Object.entries(deadlineTypes).map(([hours, label]) => ({
          value: hours,
          label: label as string,
          displayLabel: label as string
        })).sort((a, b) => parseInt(a.value) - parseInt(b.value))
        
        setDeadlineOptions(options)
        
        // Set default to 7 Days if available, otherwise first option
        if (options.length > 0 && !formData.deadline_type_id) {
          const sevenDaysOption = options.find(option => option.label === '7 Days')
          const defaultOption = sevenDaysOption || options[0]
          setFormData(prev => ({ ...prev, deadline_type_id: defaultOption.value }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch deadline options:', error)
    }
  }

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

  // Calculate words when pages or spacing changes
  useEffect(() => {
    const wordsPerPage = formData.spacing === 'single' ? 500 : 250
    const calculatedWords = formData.pages * wordsPerPage
    setFormData(prev => ({ ...prev, words: calculatedWords }))
  }, [formData.pages, formData.spacing])

  // Calculate price estimate when relevant fields change
  useEffect(() => {
    if (formData.academic_level_id && formData.discipline_id && formData.deadline_type_id && formData.language_id && formData.pages) {
      const timeoutId = setTimeout(() => {
        fetchPriceEstimate()
      }, 300) // Debounce to prevent too many API calls
      
      return () => clearTimeout(timeoutId)
    }
  }, [formData.academic_level_id, formData.discipline_id, formData.deadline_type_id, formData.language_id, formData.pages, formData.additional_features])


  // Fetch initial price estimate on component mount
  useEffect(() => {
    if (formData.academic_level_id && formData.discipline_id && formData.deadline_type_id && formData.language_id && formData.pages) {
      fetchPriceEstimate()
    }
  }, []) // Only run once on mount

  const fetchPriceEstimate = async () => {
    setIsLoadingEstimate(true)
    try {
      // Get the hours for the selected deadline
      const selectedDeadline = deadlineOptions.find(option => option.value === formData.deadline_type_id)
      if (!selectedDeadline) return
      
      const response = await fetch(`/api/pricing/estimate?${new URLSearchParams({
        academic_level_id: formData.academic_level_id,
        service_type_id: formData.discipline_id, // This maps discipline_id to service_type_id for API
        deadline_hours: selectedDeadline.value, // Use hours directly
        language_id: formData.language_id,
        pages: formData.pages.toString(),
        additional_features: JSON.stringify(formData.additional_features), // Include selected additional features
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
    // Show loading state for fields that trigger price calculation
    if (['academic_level_id', 'discipline_id', 'deadline_type_id', 'language_id', 'pages'].includes(field as string)) {
      setLoadingFields(prev => new Set(prev).add(field as string))
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Hide loading state after a short delay
    if (['academic_level_id', 'discipline_id', 'deadline_type_id', 'language_id', 'pages'].includes(field as string)) {
      setTimeout(() => {
        setLoadingFields(prev => {
          const newSet = new Set(prev)
          newSet.delete(field as string)
          return newSet
        })
        
        // Add fade-in effect
        setRecentlyUpdatedFields(prev => new Set(prev).add(field as string))
        setTimeout(() => {
          setRecentlyUpdatedFields(prev => {
            const newSet = new Set(prev)
            newSet.delete(field as string)
            return newSet
          })
        }, 1000)
      }, 800)
    }
  }

  const handleAdditionalFeatureChange = (featureId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      additional_features: checked 
        ? [...prev.additional_features, featureId]
        : prev.additional_features.filter(id => id !== featureId)
    }))
  }

  const handleSubmit = () => {
    setValidationError(null)
    
    console.log('Form submitted by user click')
    setIsUserSubmitted(true)
    
    // Prevent submission if form is not ready
    if (!isFormReady) {
      setValidationError('Please complete all required fields')
      return
    }
    
    // Calculate words based on pages and spacing
    const wordsPerPage = formData.spacing === 'single' ? 500 : 250
    const calculatedWords = formData.pages * wordsPerPage
    
    // Get the hours for the selected deadline
    const selectedDeadline = deadlineOptions.find(option => option.value === formData.deadline_type_id)
    if (!selectedDeadline) {
      setValidationError('Please select a valid deadline')
      return
    }
    
    // Prepare data for submission with correct field names
    const submitData = {
      ...formData,
      service_type_id: formData.discipline_id, // Map discipline_id to service_type_id for backend
      deadline_hours: selectedDeadline.value, // Send hours as deadline_hours
      topic: formData.topic || 'Writer\'s choice', // Ensure topic has a default value
      words: calculatedWords, // Use calculated words instead of form value
    }
    
    console.log('Submitting order with data:', submitData)
    setIsSubmitting(true)

    router.post('/dashboard/orders', submitData, {
      onSuccess: () => {
        console.log('Order created successfully')
        setIsSubmitting(false)
      },
      onError: (errors) => {
        console.error('Order creation failed:', errors)
        setValidationError('Failed to create order. Please check the form and try again.')
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
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">PLACE AN ORDER</h1>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                It's fast, secure, and confidential
                <Info className="h-5 w-5 text-gray-400" />
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Currency:</span>
              <Select defaultValue="USD">
                <SelectTrigger className="w-24 h-10 border-gray-300 rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="EUR">€ EUR</SelectItem>
                  <SelectItem value="GBP">£ GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-4 mb-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-sm font-medium text-blue-600">Paper details</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-sm font-medium text-gray-500">Payment</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-sm font-medium text-gray-500">Confirmation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="space-y-8">
                {/* Validation Error */}
                {validationError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {validationError}
                  </div>
                )}

                {/* Service Type */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900">Service Type</Label>
                  <SegmentedControl
                    value={formData.service_type}
                    onValueChange={(value) => handleInputChange('service_type', value)}
                    options={serviceTypes}
                  />
                </div>

                {/* Academic Level */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-lg font-semibold text-gray-900">Academic level</Label>
                    {loadingFields.has('academic_level_id') && <LoadingDots />}
                    {recentlyUpdatedFields.has('academic_level_id') && !loadingFields.has('academic_level_id') && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <SegmentedControl
                    value={formData.academic_level_id}
                    onValueChange={(value) => handleInputChange('academic_level_id', value)}
                    options={academicLevels}
                  />
                </div>

                {/* Paper Type and Discipline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      Type of paper
                      <Info className="h-4 w-4 text-gray-500" />
                    </Label>
                    <Select value={formData.paper_type} onValueChange={(value) => handleInputChange('paper_type', value)}>
                      <SelectTrigger className="h-12 border-gray-300 rounded-md">
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

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-lg font-semibold text-gray-900">Discipline</Label>
                      {loadingFields.has('discipline_id') && <LoadingDots />}
                      {recentlyUpdatedFields.has('discipline_id') && !loadingFields.has('discipline_id') && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <Select value={formData.discipline_id} onValueChange={(value) => handleInputChange('discipline_id', value)}>
                      <SelectTrigger className="h-12 border-gray-300 rounded-md">
                        <SelectValue placeholder="Select or type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pricingOptions?.service_types && Object.entries(pricingOptions.service_types).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{label}</span>
                              <span className="text-xs text-gray-500 ml-2">Academic Subject</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Topic */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900">Topic</Label>
                  <Input
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    placeholder="Writer's choice"
                    className="h-12 border-gray-300 rounded-md"
                  />
                </div>

                {/* Paper Instructions */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900">Paper instructions</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Write what's important for the writer to consider to meet your expectations; Include class notes, textbook pages, and grading scales; Attach tables or charts as files; they can't be pasted here."
                    rows={6}
                    className="border-gray-300 rounded-md"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900">Attachments</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Make sure files do not contain personal data (names, contacts, etc).</p>
                    <Button type="button" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                      Browse
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">or Drop files here</p>
                  </div>
                </div>

                {/* Paper Format */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900">Paper format</Label>
                  <SegmentedControl
                    value={formData.paper_format}
                    onValueChange={(value) => handleInputChange('paper_format', value)}
                    options={paperFormats}
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-lg font-semibold text-gray-900">Deadline</Label>
                    {loadingFields.has('deadline_type_id') && <LoadingDots />}
                    {recentlyUpdatedFields.has('deadline_type_id') && !loadingFields.has('deadline_type_id') && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <SegmentedControl
                      value={formData.deadline_type_id}
                      onValueChange={(value) => handleInputChange('deadline_type_id', value)}
                      options={deadlineOptions}
                    />
                    {formData.deadline_date && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm font-medium text-blue-900">Delivery Date</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          We'll send you the order for review by {new Date(formData.deadline_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pages and Spacing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-lg font-semibold text-gray-900">Pages</Label>
                      {loadingFields.has('pages') && <LoadingDots />}
                      {recentlyUpdatedFields.has('pages') && !loadingFields.has('pages') && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <NumberInput
                      value={formData.pages}
                      onChange={(value) => handleInputChange('pages', value)}
                      min={1}
                      max={100}
                    />
                    <p className="text-sm text-gray-600">{formData.words} words</p>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-900">Spacing</Label>
                    <SegmentedControl
                      value={formData.spacing}
                      onValueChange={(value) => handleInputChange('spacing', value)}
                      options={spacingOptions}
                    />
                  </div>
                </div>

                {/* Sources and Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-900">Sources to be cited</Label>
                    <NumberInput
                      value={formData.sources_count}
                      onChange={(value) => handleInputChange('sources_count', value)}
                      min={0}
                      max={50}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-gray-900">Charts</Label>
                    <NumberInput
                      value={formData.charts_count}
                      onChange={(value) => handleInputChange('charts_count', value)}
                      min={0}
                      max={20}
                    />
                  </div>
                </div>

                {/* Language */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-lg font-semibold text-gray-900">Language</Label>
                    {loadingFields.has('language_id') && <LoadingDots />}
                    {recentlyUpdatedFields.has('language_id') && !loadingFields.has('language_id') && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <Select value={formData.language_id} onValueChange={(value) => handleInputChange('language_id', value)}>
                    <SelectTrigger className="h-12 border-gray-300 rounded-md">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingOptions?.languages && Object.entries(pricingOptions.languages).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{label}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {label === 'English' ? 'No extra charge' : '+10%'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Features */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-gray-900">Additional Features (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pricingOptions?.additional_features && Object.entries(pricingOptions.additional_features).map(([id, feature]) => (
                      <div key={id} className="flex items-center space-x-3">
                        <input 
                          type="checkbox" 
                          id={`feature_${id}`}
                          className="w-4 h-4 rounded border-gray-300"
                          checked={formData.additional_features.includes(id)}
                          onChange={(e) => handleAdditionalFeatureChange(id, e.target.checked)}
                        />
                        <label htmlFor={`feature_${id}`} className="text-sm font-medium text-gray-700">
                          {feature.name} ({feature.price_display})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-blue-50 border-blue-200 shadow-lg h-fit">
              <CardContent className="p-6 space-y-4">
                {/* Order Details - Clean Format */}
                <div className="space-y-3">
                  {/* Topic */}
                  <div className="text-lg font-semibold text-gray-900">
                    {formData.topic || 'Writer\'s choice'}
                  </div>
                  
                  {/* Academic Level - Only show if selected */}
                  {formData.academic_level_id && (
                    <div className="text-sm text-gray-700">
                      {academicLevels.find(level => level.value === formData.academic_level_id)?.label}
                    </div>
                  )}
                  
                  {/* Service Type - Only show if selected */}
                  {formData.discipline_id && pricingOptions?.service_types && (
                    <div className="text-sm text-gray-700">
                      {pricingOptions.service_types[formData.discipline_id]}
                    </div>
                  )}
                  
                  {/* Language - Only show if not English (since English has no extra charge) */}
                  {formData.language_id && pricingOptions?.languages && pricingOptions.languages[formData.language_id] !== 'English' && (
                    <div className="text-sm text-gray-700">
                      {pricingOptions.languages[formData.language_id]}
                    </div>
                  )}
                  
                  
                </div>

                {/* Pricing Breakdown */}
                <div className="border-t border-blue-200 pt-3 space-y-2">
                  {/* Base Price Calculation and Total */}
                  {priceEstimate?.price_breakdown && (
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-700">
                        {formData.pages} page{formData.pages > 1 ? 's' : ''} × ${priceEstimate.price_breakdown.base_price.toFixed(2)}
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        ${priceEstimate.price_breakdown.base_price ? (priceEstimate.price_breakdown.base_price * formData.pages).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Features - Only show if selected */}
                  {formData.additional_features.length > 0 && pricingOptions?.additional_features && priceEstimate?.price_breakdown && (
                    <>
                      {formData.additional_features.map((featureId) => {
                        const feature = pricingOptions.additional_features[featureId]
                        if (!feature) return null
                        
                        // Calculate individual feature cost
                        const basePrice = priceEstimate.price_breakdown.base_price * formData.pages
                        const featureAmount = typeof feature.amount === 'number' ? feature.amount : parseFloat(feature.amount) || 0
                        const featureCost = feature.type === 'fixed' 
                          ? featureAmount
                          : basePrice * (featureAmount / 100)
                        
                        return (
                          <div key={featureId} className="flex justify-between items-center text-sm text-gray-700">
                            <span>{feature.name}</span>
                            <span className="font-medium">
                              ${isNaN(featureCost) ? '0.00' : featureCost.toFixed(2)}
                            </span>
                          </div>
                        )
                      })}
                    </>
                  )}
                  
                  {/* Total Price */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-base font-semibold text-gray-900">Total price</span>
                    <div className="flex items-center gap-2">
                      {isLoadingEstimate ? (
                        <div className="flex items-center gap-2">
                          <LoadingDots />
                          <span className="text-sm text-gray-500">Calculating...</span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-green-600">
                          {priceEstimate?.formatted_total_price || '$0.00'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Note: VAT may be charged upon checkout for EU citizens.
                  </p>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">Select payment method</Label>
                  <Select defaultValue="paypal">
                    <SelectTrigger className="h-10 border-gray-300 rounded-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paypal" className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">P</div>
                        PayPal
                      </SelectItem>
                      <SelectItem value="stripe">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Safe Checkout Button */}
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-semibold rounded-md shadow-md"
                  disabled={isSubmitting || !isFormReady || !priceEstimate}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Safe checkout
                </Button>

                {/* Reviews */}
                <div className="text-center space-y-2 pt-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-base font-semibold text-gray-900">Excellent</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-3 h-3 fill-green-500 text-green-500" />
                      ))}
                    </div>
                    <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-700">4.7</span>
                  </div>
                  <p className="text-xs text-gray-600">Based on 2,024 reviews</p>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-sm flex items-center justify-center">
                      <Star className="w-2 h-2 text-white fill-white" />
                    </div>
                    <span className="text-xs text-green-600 font-semibold">Trustpilot</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}