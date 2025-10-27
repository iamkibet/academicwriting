import { Head, usePage, router } from '@inertiajs/react'
import { useState } from 'react'
import { User } from '@/types'
import ClientLayout from '@/components/layouts/ClientLayout'
import OrderStatusChange from '@/components/admin/order-status-change'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, FileText, MessageSquare, Folder, Plus, BarChart3, TrendingUp, Calendar, GraduationCap, Info } from 'lucide-react'
import { OrderStatus, getOrderStatusLabel, getOrderStatusColor, isOrderStatusRequiresPayment } from '@/types/order-status'

interface OrderShowPageProps {
  order: {
    id: number
    title: string
    description: string
    academic_level_id: number
    paper_type?: string
    discipline_id: number
    service_type_id: number
    deadline_hours: number
    deadline_date: string
    pages: number
    words: number
    price: number
    total_price?: number
    status: string
    payment_status?: string
    client_id: number
    writer_id?: number
    admin_notes?: string
    client_notes?: string
    paper_format?: string
    number_of_sources?: number
    additional_features?: Array<{
      id: number
      name: string
      type: 'fixed' | 'percent'
      amount: number
      description?: string
    }>
    created_at: string
    updated_at: string
    academic_level?: {
      id: number
      level: string
    }
    discipline?: {
      id: number
      name: string
    }
    service_type?: {
      id: number
      name: string
    }
    language?: {
      id: number
      name: string
    }
    files?: Array<{
      id: number
      file_name: string
      file_path: string
      file_type: string
      file_size: number
      file_category: string
      uploaded_by_user_id: number
      created_at: string
      formatted_file_size: string
    }>
  }
  errors?: Record<string, string>
}

export default function OrderShowPage({ order, errors }: OrderShowPageProps) {
  const { auth } = usePage().props as any
  const isAdmin = auth.user.role === 'admin'
  const user = auth.user
  const [activeTab, setActiveTab] = useState('info')

  const isUnpaid = order.payment_status === 'unpaid' || order.payment_status === 'pending' || isOrderStatusRequiresPayment(order.status)
  const deadlineDate = new Date(order.deadline_date)
  const isUrgent = deadlineDate.getTime() - Date.now() < 24 * 60 * 60 * 1000

  const tabs = [
    { key: 'info', label: 'Info', icon: FileText },
    { key: 'messages', label: 'Messages', icon: MessageSquare },
    { key: 'files', label: 'Files', icon: Folder },
  ]

  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [serviceQuantities, setServiceQuantities] = useState<{[key: string]: number}>({
    additional_pages: 1,
    powerpoint: 1,
    shorten_deadline: 1
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDeadline, setSelectedDeadline] = useState<string>('')

  // Simple approach: just use the order's total price divided by pages
  const orderPricePerPage = typeof order.price === 'string' ? parseFloat(order.price) : (order.price || 0)
  const orderPages = typeof order.pages === 'string' ? parseInt(order.pages) : (order.pages || 1)
  const basePricePerPage = orderPricePerPage / orderPages

  // Deadline options for shorten deadline service
  const deadlineOptions = [
    { value: '8', label: '8 hours', price: basePricePerPage * 2 },
    { value: '24', label: '24 hours', price: basePricePerPage * 1.8 },
    { value: '48', label: '48 hours', price: basePricePerPage * 1.6 },
    { value: '72', label: '3 days', price: basePricePerPage * 1.4 },
    { value: '120', label: '5 days', price: basePricePerPage * 1.2 },
    { value: '168', label: '7 days', price: basePricePerPage * 1.1 },
  ]

  const additionalServices = [
    { 
      key: 'additional_pages', 
      label: 'Additional pages', 
      icon: Plus, 
      color: 'text-green-600',
      price: basePricePerPage, // Dynamic based on order's base per-page cost
      description: 'Add more pages to your order',
      detailedDescription: 'Extra pages for your order',
      hasQuantity: true,
      unit: 'page'
    },
    { 
      key: 'powerpoint', 
      label: 'PowerPoint slides', 
      icon: BarChart3, 
      color: 'text-blue-600',
      price: basePricePerPage * 0.8, // 80% of base per-page cost for slides
      description: 'Create presentation slides',
      detailedDescription: 'PowerPoint slides from your content',
      hasQuantity: true,
      unit: 'slide'
    },
    { 
      key: 'shorten_deadline', 
      label: 'Shorten deadline', 
      icon: Calendar, 
      color: 'text-orange-600',
      price: basePricePerPage * 2, // 2x base per-page cost for rush delivery
      description: 'Rush delivery service',
      detailedDescription: 'Faster delivery service',
      hasQuantity: false,
      unit: 'service'
    },
    { 
      key: 'boost_writer', 
      label: 'Top writer', 
      icon: GraduationCap, 
      color: 'text-purple-600',
      price: basePricePerPage * 1.5, // 1.5x base per-page cost for top writer
      description: 'Assign to our best writers',
      detailedDescription: 'Get our best writers',
      hasQuantity: false,
      unit: 'service'
    },
  ]

  const handlePayment = () => {
    router.visit(`/dashboard/orders/${order.id}#payment`)
  }

  const handleReviewAndPay = () => {
    router.visit(`/dashboard/orders/${order.id}#payment`)
  }

  const handleServiceClick = (service: any) => {
    setSelectedService(service)
    setShowServiceModal(true)
  }

  const handleServiceToggle = (serviceKey: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceKey) 
        ? prev.filter(key => key !== serviceKey)
        : [...prev, serviceKey]
    )
  }

  const handleQuantityChange = (serviceKey: string, quantity: number) => {
    setServiceQuantities(prev => ({
      ...prev,
      [serviceKey]: Math.max(1, quantity)
    }))
  }

  const calculateServiceTotal = () => {
    return selectedServices.reduce((total, serviceKey) => {
      const service = additionalServices.find(s => s.key === serviceKey)
      if (!service) return total
      
      const quantity = serviceQuantities[serviceKey] || 1
      return total + (service.price * quantity)
    }, 0)
  }

  const handleAddServicesToOrder = () => {
    if (selectedServices.length === 0) return

    const servicesData = selectedServices.map(serviceKey => {
      const service = additionalServices.find(s => s.key === serviceKey)
      const quantity = serviceQuantities[serviceKey] || 1
      
      // For additional pages, let the backend calculate the exact price
      // For other services, use the frontend calculated price
      const totalPrice = serviceKey === 'additional_pages' 
        ? 0 // Backend will calculate this using the exact base price
        : (service?.price || 0) * quantity
      
      return {
        service_key: serviceKey,
        name: service?.label || '',
        price: service?.price || 0,
        quantity: quantity,
        total_price: totalPrice
      }
    })

    router.post(`/dashboard/orders/${order.id}/add-services`, {
      services: servicesData
    }, {
      onSuccess: () => {
        // Reset selections
        setSelectedServices([])
        setServiceQuantities({
          additional_pages: 1,
          powerpoint: 1,
          shorten_deadline: 1
        })
        // Show success message
        setShowSuccessMessage(true)
        setTimeout(() => setShowSuccessMessage(false), 3000)
      },
      onError: (errors) => {
        console.error('Failed to add services:', errors)
        alert('Failed to add services. Please try again.')
      }
    })
  }

  const formatPrice = (price: number | string | undefined | null): string => {
    if (price === null || price === undefined || price === '') {
      return '$0.00'
    }
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price
    
    if (isNaN(numericPrice)) {
      return '$0.00'
    }
    
    return `$${numericPrice.toFixed(2)}`
  }

  const calculatePricingBreakdown = () => {
    const totalPrice = typeof order.price === 'string' ? parseFloat(order.price) : (order.price || 0)
    const pages = typeof order.pages === 'string' ? parseInt(order.pages) : (order.pages || 1)
    
    // Ensure we have valid numbers
    const validTotalPrice = isNaN(totalPrice) ? 0 : totalPrice
    const validPages = isNaN(pages) || pages <= 0 ? 1 : pages
    
    // Calculate additional features total from the actual data
    let additionalFeaturesTotal = 0
    let additionalFeaturesBreakdown: Array<{name: string, price: number}> = []
    
    if (order.additional_features && Array.isArray(order.additional_features)) {
      // Process additional features with their details
      additionalFeaturesBreakdown = order.additional_features.map((feature: any) => {
        let price = 0
        if (feature.type === 'fixed') {
          price = typeof feature.amount === 'string' ? parseFloat(feature.amount) : (feature.amount || 0)
        } else if (feature.type === 'percent') {
          // For percentage features, we need to calculate based on the base price
          // Since we don't have the original base price, we'll estimate it
          const percentage = typeof feature.amount === 'string' ? parseFloat(feature.amount) : (feature.amount || 0)
          // Estimate base price by subtracting known fixed additional features
          const fixedFeaturesTotal = (order.additional_features || [])
            .filter((f: any) => f.type === 'fixed')
            .reduce((sum: number, f: any) => sum + (typeof f.amount === 'string' ? parseFloat(f.amount) : (f.amount || 0)), 0)
          const estimatedBasePrice = validTotalPrice - fixedFeaturesTotal
          price = estimatedBasePrice * (percentage / 100)
        }
        
        return {
          name: feature.name || 'Additional Feature',
          price: price
        }
      })
      additionalFeaturesTotal = additionalFeaturesBreakdown.reduce((sum, feature) => sum + feature.price, 0)
    }
    
    // Calculate base price by subtracting additional features from total
    const basePrice = validTotalPrice - additionalFeaturesTotal
    
    return {
      pages: validPages,
      pricePerPage: basePrice / validPages,
      basePrice: basePrice,
      additionalFeatures: additionalFeaturesTotal,
      additionalFeaturesBreakdown: additionalFeaturesBreakdown,
      total: validTotalPrice
    }
  }

  const pricing = calculatePricingBreakdown()

  return (
    <ClientLayout user={user}>
      <Head title={`Order #${String(order.id).padStart(4, '0')}`} />
      
      <div className="bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Services added to order successfully!
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Header Section */}
        <div className="mb-6">
            {/* Title and Order ID Row */}
            <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold">{order.title}</h1>
              <span className="text-lg text-gray-500">#{String(order.id).padStart(4, '0')}</span>
            </div>

            {/* Payment Status and Info Row */}
            <div className="flex items-center gap-4 mb-4">
              {isUnpaid && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  Waiting for payment
                </Badge>
              )}
              {isUnpaid && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-1">
                  <p className="text-sm text-gray-700">
                    Your order is unpaid. Please check your email and follow the tips to complete the payment procedure.
                  </p>
                </div>
              )}
              <div className="text-sm text-gray-600">
                Deadline: {deadlineDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })} {isUrgent && isUnpaid && '(if you pay right now)'}
              </div>
            </div>

            {/* Tabs and Buttons Row */}
            <div className="flex items-center justify-between border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
              
              <div className="flex items-center gap-3">
                {isUnpaid && (
                  <Button
                    onClick={handlePayment}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleReviewAndPay}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Review & Pay
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 min-h-[600px]">
                  {activeTab === 'info' && (
                    <div className="space-y-6">
                      {/* Order Details */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Academic level</span>
                          <span className="text-sm">{order.academic_level?.level || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Type of paper</span>
                          <span className="text-sm">{order.paper_type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Discipline</span>
                          <span className="text-sm">{order.discipline?.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Topic</span>
                          <span className="text-sm">{order.title}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Paper details</span>
                          <span className="text-sm">{order.description}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Paper format</span>
                          <span className="text-sm">{order.paper_format || 'APA'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Deadline</span>
                          <span className="text-sm">
                            {deadlineDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })} {isUrgent && isUnpaid && '(if you pay right now)'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Number of sources</span>
                          <span className="text-sm">{order.number_of_sources || '2'}</span>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">Pricing Breakdown</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              {pricing.pages} pages x {formatPrice(pricing.pricePerPage)}
                              <Info className="w-3 h-3 inline ml-1 text-gray-400" />
                            </span>
                            <span className="text-sm font-medium">{formatPrice(pricing.basePrice)}</span>
                          </div>
                          {pricing.additionalFeaturesBreakdown.map((feature, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{feature.name}</span>
                              <span className="text-sm font-medium">{formatPrice(feature.price)}</span>
                            </div>
                          ))}
                          <div className="border-t pt-3 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold">Grand total price</span>
                              <span className="text-lg font-bold">{formatPrice(pricing.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review & Pay Button */}
                      <Button
                        onClick={handleReviewAndPay}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                      >
                        Review & Pay {formatPrice(pricing.total)}
                      </Button>
                    </div>
                  )}

                  {activeTab === 'messages' && (
                    <div className="flex items-center justify-center h-full min-h-[500px]">
                      <div className="text-center">
                        <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No messages yet</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'files' && (
                    <div className="min-h-[500px]">
                      {order.files && order.files.length > 0 ? (
                        <div className="space-y-3">
                          {order.files
                            .filter(file => file.file_category === 'requirements')
                            .map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Folder className="w-5 h-5 text-blue-600" />
                                  <div>
                                    <p className="text-sm font-medium">{file.file_name}</p>
                                    <p className="text-xs text-gray-500">
                                      {file.formatted_file_size} • {new Date(file.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const link = document.createElement('a')
                                    link.href = `/dashboard/orders/${order.id}/files/${file.id}/download`
                                    link.download = file.file_name
                                    link.click()
                                  }}
                                >
                                  Download
                                </Button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[500px]">
                          <div className="text-center">
                            <Folder className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">No files uploaded yet</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Additional Services */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add services to your order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {additionalServices.map((service) => {
                      const Icon = service.icon
                      const isSelected = selectedServices.includes(service.key)
                      
                      return (
                        <div
                          key={service.key}
                          className={`relative border rounded-lg p-4 transition-all duration-300 cursor-pointer group ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                          }`}
                          style={{ height: '140px' }}
                          onClick={() => handleServiceClick(service)}
                        >
                          {/* Main content */}
                          <div className="flex flex-col items-center text-center h-full">
                            <div className={`p-3 rounded-lg mb-3 transition-all duration-300 ${
                              isSelected ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-50'
                            }`}>
                              <Icon className={`w-8 h-8 ${service.color} transition-transform duration-300 group-hover:scale-110`} />
                            </div>
                            <h3 className="font-medium text-sm text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                              {service.label}
                            </h3>
                            <p className="text-xs text-gray-500 mb-2">{service.description}</p>
                            
                            {/* Simple hover overlay */}
                            <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center items-center p-4">
                              <div className="text-center">
                                <h4 className="font-medium text-sm text-gray-900 mb-1">
                                  {service.label}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                  {service.detailedDescription}
                                </p>
                                <div className="text-lg font-bold text-blue-600">
                                  ${service.price.toFixed(2)} per {service.unit}
                                </div>
                              </div>
                            </div>
                            
                            {/* Selected state indicator */}
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {selectedServices.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-900">Selected Services</h4>
                        <span className="text-lg font-bold text-green-600">
                          +${calculateServiceTotal().toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {selectedServices.map(serviceKey => {
                          const service = additionalServices.find(s => s.key === serviceKey)
                          const quantity = serviceQuantities[serviceKey] || 1
                          if (!service) return null
                          
                          return (
                            <div key={serviceKey} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                {service.label} {service.hasQuantity && quantity > 1 && `× ${quantity}`}
                              </span>
                              <span className="font-medium">
                                ${(service.price * quantity).toFixed(2)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      <button 
                        onClick={handleAddServicesToOrder}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                      >
                        Add to Order
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Status Change */}
              {isAdmin && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Admin Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OrderStatusChange 
                      order={order} 
                      currentStatus={order.status}
                      onStatusChange={(newStatus) => {
                        // Update the order status in the component state
                        // This could be handled by Inertia's reactive updates
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Service Selection Modal */}
      {showServiceModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add {selectedService.label}
              </h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {selectedService.key === 'shorten_deadline' ? (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  It takes approximately 1 hour to write 1 page of quality text. We suggest that you limit the number of hours for an order to be completed according to the number of pages required. Thank you for your understanding.
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select deadline:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {deadlineOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedDeadline(option.value)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          selectedDeadline === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {selectedDeadline && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">
                      The deadline will be calculated starting from payment date.
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      Price: ${deadlineOptions.find(opt => opt.value === selectedDeadline)?.price.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  {selectedService.detailedDescription}
                </p>
                
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-blue-600">
                    ${selectedService.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {selectedService.unit}
                  </div>
                </div>

                {selectedService.hasQuantity && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={() => {
                          const currentQty = serviceQuantities[selectedService.key] || 1
                          handleQuantityChange(selectedService.key, currentQty - 1)
                        }}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xl font-medium w-12 text-center">
                        {serviceQuantities[selectedService.key] || 1}
                      </span>
                      <button
                        onClick={() => {
                          const currentQty = serviceQuantities[selectedService.key] || 1
                          handleQuantityChange(selectedService.key, currentQty + 1)
                        }}
                        className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-lg font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowServiceModal(false)
                  setSelectedDeadline('')
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleServiceToggle(selectedService.key)
                  setShowServiceModal(false)
                  setSelectedDeadline('')
                }}
                disabled={selectedService.key === 'shorten_deadline' && !selectedDeadline}
                className={`flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                  selectedService.key === 'shorten_deadline' && !selectedDeadline
                    ? 'bg-gray-400 cursor-not-allowed'
                    : selectedServices.includes(selectedService.key)
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {selectedServices.includes(selectedService.key) ? 'Remove from Order' : 'Add to Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  )
}
