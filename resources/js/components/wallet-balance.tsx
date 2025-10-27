import { useState, useEffect } from 'react'
import { Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Plus, Wallet } from 'lucide-react'
import { WalletTopUpModal } from '@/components/wallet-topup-modal'

interface WalletData {
  balance: number
  formatted_balance: string
  statistics: {
    current_balance: number
    total_credits: number
    total_debits: number
    total_transactions: number
    credit_transactions: number
    debit_transactions: number
  }
}

interface WalletTransaction {
  id: number
  type: 'credit' | 'debit'
  amount: number
  description: string
  order_id?: number
  payment_method: string
  status: string
  created_at: string
  formatted_amount: string
}

interface WalletBalanceProps {
  showTransactions?: boolean
  showTopUpButton?: boolean
}

export function WalletBalance({ showTransactions = true, showTopUpButton = true }: WalletBalanceProps) {
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)

  useEffect(() => {
    fetchWalletData()
    if (showTransactions) {
      fetchTransactions()
    }
  }, [showTransactions])

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/wallet')
      if (response.ok) {
        const data = await response.json()
        setWalletData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true)
    try {
      const response = await fetch('/api/wallet/transactions')
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const handleTopUp = () => {
    setIsTopUpModalOpen(true)
  }

  const handleTopUpSuccess = () => {
    // Refresh wallet data after successful top-up
    fetchWalletData()
    if (showTransactions) {
      fetchTransactions()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Spinner className="w-6 h-6" />
            <span className="ml-2">Loading wallet...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!walletData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Failed to load wallet data
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <WalletTopUpModal
        open={isTopUpModalOpen}
        onOpenChange={setIsTopUpModalOpen}
        onSuccess={handleTopUpSuccess}
      />
      <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-[#05ADA3] to-[#048e86] text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <CardTitle className="text-white">Wallet Balance</CardTitle>
          </div>
          <CardDescription className="text-white/90">
            Your current wallet balance and transaction summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Balance */}
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-[#05ADA3]">
                {walletData.formatted_balance}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Current Balance
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  +${walletData.statistics.total_credits.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Credits
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-red-600">
                  -${walletData.statistics.total_debits.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Debits
                </div>
              </div>
            </div>

            {/* Top Up Button */}
            {showTopUpButton && (
              <div className="pt-4">
                <Button onClick={handleTopUp} className="w-full bg-[#05ADA3] hover:bg-[#048e86] flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Top Up Wallet
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {showTransactions && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Your recent wallet transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="w-6 h-6" />
                <span className="ml-2">Loading transactions...</span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-md border">
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()} • 
                        {transaction.order_id && ` Order #${transaction.order_id}`}
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.formatted_amount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </>
  )
}
