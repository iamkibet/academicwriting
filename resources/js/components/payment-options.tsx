import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { AlertError } from '@/components/alert-error'

interface PaymentOption {
  type: string
  label: string
  amount: number
  wallet_amount: number
  paypal_amount: number
  available: boolean
}

interface PaymentOptionsProps {
  orderId: number
  orderAmount: number
  walletBalance: number
  paymentOptions: PaymentOption[]
  onPaymentSuccess?: () => void
  errors?: Record<string, string>
}

export function PaymentOptions({ 
  orderId, 
  orderAmount, 
  walletBalance, 
  paymentOptions, 
  onPaymentSuccess,
  errors 
}: PaymentOptionsProps) {
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handlePayment = async (paymentType: string, walletAmount?: number, paypalTransactionId?: string) => {
    setProcessingPayment(paymentType)
    setPaymentError(null)

    try {
      let endpoint = ''
      let payload: any = {}

      switch (paymentType) {
        case 'wallet_full':
          endpoint = `/api/orders/${orderId}/pay/wallet`
          break
        case 'paypal_full':
          endpoint = `/api/orders/${orderId}/pay/paypal`
          payload = { paypal_transaction_id: paypalTransactionId || 'mock_paypal_id' }
          break
        case 'hybrid':
          endpoint = `/api/orders/${orderId}/pay/hybrid`
          payload = { 
            wallet_amount: walletAmount,
            paypal_transaction_id: paypalTransactionId || 'mock_paypal_id'
          }
          break
        default:
          throw new Error('Invalid payment type')
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        onPaymentSuccess?.()
        // Redirect to order tracking or success page
        router.visit(`/orders/${orderId}`)
      } else {
        setPaymentError(data.message || 'Payment failed')
      }
    } catch (error) {
      setPaymentError('Payment processing failed. Please try again.')
      console.error('Payment error:', error)
    } finally {
      setProcessingPayment(null)
    }
  }

  const handleWalletPayment = () => {
    handlePayment('wallet_full')
  }

  const handlePayPalPayment = () => {
    // In a real implementation, this would open PayPal SDK
    handlePayment('paypal_full')
  }

  const handleHybridPayment = (walletAmount: number) => {
    // In a real implementation, this would open PayPal SDK for the remaining amount
    handlePayment('hybrid', walletAmount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Options</CardTitle>
        <CardDescription>
          Choose how you'd like to pay for your order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AlertError errors={errors} />
        
        {paymentError && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {paymentError}
          </div>
        )}

        {/* Order Summary */}
        <div className="p-4 rounded-md bg-muted/50">
          <div className="flex justify-between items-center">
            <span className="font-medium">Order Total:</span>
            <span className="text-xl font-bold">${orderAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Wallet Balance:</span>
            <span>${walletBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-3">
          {paymentOptions.map((option) => (
            <div key={option.type} className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="font-medium">{option.label}</h4>
                  {option.wallet_amount > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Wallet: ${option.wallet_amount.toFixed(2)}
                      {option.paypal_amount > 0 && ` + PayPal: $${option.paypal_amount.toFixed(2)}`}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => {
                    if (option.type === 'wallet_full') {
                      handleWalletPayment()
                    } else if (option.type === 'paypal_full') {
                      handlePayPalPayment()
                    } else if (option.type === 'hybrid') {
                      handleHybridPayment(option.wallet_amount)
                    }
                  }}
                  disabled={!option.available || processingPayment === option.type}
                  className="min-w-32"
                >
                  {processingPayment === option.type ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Pay $${option.amount.toFixed(2)}`
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Top Up Wallet Option */}
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              // In a real implementation, this would open a wallet top-up modal
              console.log('Top up wallet clicked')
            }}
          >
            Top Up Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
