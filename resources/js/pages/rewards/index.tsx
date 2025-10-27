import { Head, usePage } from '@inertiajs/react'
import ClientLayout from '@/components/layouts/ClientLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Copy } from 'lucide-react'
import { useState } from 'react'

interface Reward {
  points: number
  total_points_earned: number
  total_points_redeemed: number
}

interface Coupon {
  id: number
  code: string
  name: string
  description: string
  discount_type: 'percentage' | 'fixed'
  discount_amount: number
  minimum_order_amount: number
}

interface CouponUsage {
  id: number
  coupon: Coupon
  discount_amount: number
  created_at: string
}

interface RewardsPageProps {
  auth: { user: any }
  availableCoupons: Coupon[]
  usedCoupons: CouponUsage[]
  totalSpending: number
  loyaltyDiscount: number
  reward: Reward
  nextTier: {
    threshold: number
    discount: number
    name: string
  } | null
  progress: number
}

export default function RewardsIndex() {
  const page = usePage()
  const { auth, availableCoupons, usedCoupons, totalSpending, loyaltyDiscount, reward } = page.props as any
  const [activeTab, setActiveTab] = useState<'coupons' | 'invite'>('coupons')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleApplyCoupon = (code: string) => {
    // Store in session or redirect to order page with coupon
    console.log('Applying coupon:', code)
    window.location.href = `/dashboard/orders/create?coupon=${code}`
  }

  const loyaltyTiers = [
    { amount: 500, discount: 5 },
    { amount: 1000, discount: 10 },
    { amount: 2000, discount: 15 },
  ]

  return (
    <ClientLayout user={auth.user}>
      <Head title="Rewards program" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Rewards program</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('coupons')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'coupons'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Coupons
            </button>
            <button
              onClick={() => setActiveTab('invite')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invite'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Invite a friend
            </button>
          </nav>
        </div>

        {activeTab === 'coupons' && (
          <div className="space-y-8">
            {/* Enjoy specials section */}
            <Card className="bg-gray-50 border border-gray-200">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Enjoy specials for staying with us
                </h2>
                <p className="text-gray-600">
                  This is a single space for all of your personal offers and discounts.
                  Keep in mind that you can only apply one coupon to your order at a time.
                </p>
              </CardContent>
            </Card>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Your Coupons */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Your coupons
                  </CardTitle>
                </CardHeader>
                <CardContent>
                                     {availableCoupons.length > 0 ? (
                     <div className="space-y-3">
                       {availableCoupons.map((coupon: Coupon) => (
                        <div key={coupon.id} className="relative">
                          <div className="bg-blue-700 rounded-lg p-6 flex items-center justify-between">
                            <div className="text-3xl font-bold text-white tracking-wider">
                              {coupon.code}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyCode(coupon.code)}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3"
                              >
                                {copiedCode === coupon.code ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  coupon.code
                                )}
                              </Button>
                              <Button
                                onClick={() => handleApplyCoupon(coupon.code)}
                                className="bg-blue-500 hover:bg-blue-400 text-white px-4"
                              >
                                Use coupon
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No available coupons at the moment.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Your loyalty pays off */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Your loyalty pays off
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-600">
                    ${totalSpending.toFixed(2)} total spent
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-8">
                    As the sum of your approved orders reaches $500, $1000, and $2000, you will get a lifetime discount of 5%, 10%, and 15% respectively.
                  </p>

                  {/* Loyalty Tiers Visualization */}
                  <div className="relative">
                    {/* Background line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2" />

                    {/* Tier Markers */}
                    <div className="relative flex justify-between">
                      {loyaltyTiers.map((tier, index) => {
                        const isReached = totalSpending >= tier.amount

                        return (
                          <div key={tier.amount} className="flex flex-col items-center">
                            {/* Discount Label */}
                            <div className={`text-sm font-semibold mb-3 ${isReached ? 'text-blue-600' : 'text-gray-600'}`}>
                              {tier.discount}% off
                            </div>
                            
                            {/* Circle Marker */}
                            <div className="relative z-10">
                              <div
                                className={`w-4 h-4 rounded-full border-2 border-white ${
                                  isReached ? 'bg-blue-600' : 'bg-gray-400'
                                }`}
                              >
                                {isReached && (
                                  <CheckCircle className="h-3 w-3 text-white absolute top-0.5 left-0.5" />
                                )}
                              </div>
                            </div>
                            
                            {/* Amount Label */}
                            <div className={`text-sm font-semibold mt-3 ${isReached ? 'text-blue-600' : 'text-gray-600'}`}>
                              ${tier.amount}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'invite' && (
          <div className="space-y-8">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Invite a Friend
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Share your unique referral link with friends and earn rewards!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Referral Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/register?ref=${auth.user.id}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/register?ref=${auth.user.id}`)
                          setCopiedCode('referral')
                          setTimeout(() => setCopiedCode(null), 2000)
                        }}
                        className="bg-blue-600 hover:bg-blue-500"
                      >
                        {copiedCode === 'referral' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your friends will get a special discount on their first order, and you'll earn points!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ClientLayout>
  )
}
