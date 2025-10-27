import { Head, usePage } from '@inertiajs/react'
import ClientLayout from '@/components/layouts/ClientLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Plus, Wallet as WalletIcon } from 'lucide-react'
import { WalletTopUpModal } from '@/components/wallet-topup-modal'
import { useState, useEffect } from 'react'

interface WalletData {
  balance: number
  formatted_balance: string
}

interface WalletTransaction {
  id: number
  type: 'credit' | 'debit'
  amount: number
  description: string
  payment_method: string
  status: string
  created_at: string
  formatted_amount: string
}

interface WalletPageProps {
  wallet?: WalletData
}

export default function WalletPage() {
  const { auth } = usePage<{ auth: { user: any } }>().props
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)

  useEffect(() => {
    fetchWalletData()
    fetchTransactions()
  }, [])

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/wallet')
      if (response.ok) {
        const data = await response.json()
        setWallet(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/wallet/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const handleTopUpSuccess = () => {
    fetchWalletData()
    fetchTransactions()
  }

  if (isLoading) {
    return (
      <ClientLayout user={auth.user}>
        <Head title="My wallet" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner className="w-6 h-6" />
            <span className="ml-2">Loading...</span>
          </div>
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout user={auth.user}>
      <Head title="My wallet" />
      
      <WalletTopUpModal
        open={isTopUpModalOpen}
        onOpenChange={setIsTopUpModalOpen}
        onSuccess={handleTopUpSuccess}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My wallet</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Balance Card */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Balance Amount */}
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {wallet?.formatted_balance || '$0.00'}
                </div>
              </div>

              {/* Add Funds Button */}
              <Button
                onClick={() => setIsTopUpModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Funds
              </Button>

              {/* Illustration Area */}
              <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden mt-4">
                <svg
                  viewBox="0 0 400 200"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Wallet */}
                  <g transform="translate(140, 80)">
                    <rect
                      width="120"
                      height="80"
                      rx="8"
                      fill="#4B5563"
                      stroke="#374151"
                      strokeWidth="2"
                    />
                    <circle
                      cx="60"
                      cy="20"
                      r="8"
                      fill="#3B82F6"
                    />
                  </g>

                  {/* Person 1 - Emerging from wallet */}
                  <g transform="translate(110, 30)">
                    <circle cx="15" cy="15" r="12" fill="#1F2937" />
                    <rect
                      x="0"
                      y="30"
                      width="30"
                      height="40"
                      rx="15"
                      fill="#1F2937"
                    />
                    <rect
                      x="18"
                      y="25"
                      width="20"
                      height="15"
                      rx="3"
                      fill="#3B82F6"
                    />
                  </g>

                  {/* Money bill 1 */}
                  <g transform="translate(80, 20)">
                    <rect
                      width="50"
                      height="25"
                      rx="4"
                      fill="#22C55E"
                    />
                    <line
                      x1="10"
                      y1="12"
                      x2="40"
                      y2="12"
                      stroke="#15803D"
                      strokeWidth="1"
                    />
                  </g>

                  {/* Person 2 on platform */}
                  <g transform="translate(220, 90)">
                    <rect
                      x="-10"
                      y="40"
                      width="40"
                      height="8"
                      rx="4"
                      fill="#1F2937"
                    />
                    <circle cx="10" cy="10" r="12" fill="#1F2937" />
                    <rect
                      x="-5"
                      y="25"
                      width="30"
                      height="20"
                      rx="15"
                      fill="#1F2937"
                    />
                  </g>

                  {/* Money bill 2 */}
                  <g transform="translate(200, 50)">
                    <rect
                      width="50"
                      height="25"
                      rx="4"
                      fill="#22C55E"
                    />
                    <line
                      x1="10"
                      y1="12"
                      x2="40"
                      y2="12"
                      stroke="#15803D"
                      strokeWidth="1"
                    />
                  </g>

                  {/* Person 3 crouching */}
                  <g transform="translate(250, 130)">
                    <circle cx="8" cy="8" r="10" fill="#1F2937" />
                    <rect
                      x="0"
                      y="18"
                      width="20"
                      height="25"
                      rx="10"
                      fill="#3B82F6"
                    />
                    <rect
                      x="-2"
                      y="18"
                      width="24"
                      height="15"
                      rx="7"
                      fill="#1F2937"
                    />
                  </g>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card className="bg-white border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  {/* Empty Box Illustration */}
                  <svg
                    viewBox="0 0 200 150"
                    className="w-48 h-36 mb-6"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Box outline */}
                    <rect
                      x="40"
                      y="40"
                      width="120"
                      height="80"
                      fill="none"
                      stroke="#D1D5DB"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* Top flap */}
                    <rect
                      x="40"
                      y="40"
                      width="120"
                      height="30"
                      fill="none"
                      stroke="#D1D5DB"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* Floating items */}
                    <circle cx="70" cy="30" r="3" fill="#D1D5DB" />
                    <circle cx="90" cy="25" r="3" fill="#D1D5DB" />
                    <circle cx="110" cy="30" r="3" fill="#D1D5DB" />
                    <circle cx="130" cy="25" r="3" fill="#D1D5DB" />
                    <circle cx="150" cy="30" r="3" fill="#D1D5DB" />

                    <text
                      x="80"
                      y="25"
                      fontSize="8"
                      fill="#D1D5DB"
                      fontFamily="Arial"
                    >
                      +
                    </text>
                    <text
                      x="120"
                      y="25"
                      fontSize="8"
                      fill="#D1D5DB"
                      fontFamily="Arial"
                    >
                      +
                    </text>
                    <text
                      x="100"
                      y="20"
                      fontSize="10"
                      fill="#D1D5DB"
                      fontFamily="Arial"
                    >
                      ✈
                    </text>
                  </svg>

                  <p className="text-gray-500 text-center">
                    There are no transactions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'credit'
                              ? 'bg-green-100'
                              : 'bg-red-100'
                          }`}
                        >
                          {transaction.type === 'credit' ? (
                            <WalletIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <WalletIcon className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          transaction.type === 'credit'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}
                        {transaction.formatted_amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  )
}
