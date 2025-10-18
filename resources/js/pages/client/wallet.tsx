import { Head } from '@inertiajs/react'
import { WalletBalance } from '@/components/wallet-balance'

interface WalletPageProps {
  wallet?: {
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
  errors?: Record<string, string>
}

export default function WalletPage({ wallet, errors }: WalletPageProps) {
  return (
    <>
      <Head title="Wallet & Payments" />
      
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Wallet & Payments</h1>
          <p className="text-muted-foreground">
            Manage your wallet balance and view transaction history
          </p>
        </div>
        
        <WalletBalance showTransactions={true} showTopUpButton={true} />
      </div>
    </>
  )
}
