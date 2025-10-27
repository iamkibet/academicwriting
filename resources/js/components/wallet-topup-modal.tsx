import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { AlertCircle, Check } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WalletTopUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const presetAmounts = [10, 25, 50, 100, 200, 500]

export function WalletTopUpModal({ open, onOpenChange, onSuccess }: WalletTopUpModalProps) {
  const [amount, setAmount] = useState<string>('')
  const [customAmount, setCustomAmount] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePresetSelect = (preset: number) => {
    setAmount(preset.toString())
    setCustomAmount('')
    setError(null)
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setAmount('')
    setError(null)
  }

  const getFinalAmount = () => {
    if (customAmount) {
      const parsed = parseFloat(customAmount)
      return isNaN(parsed) ? 0 : parsed
    }
    return parseFloat(amount) || 0
  }

  const finalAmount = getFinalAmount()

  const handleTopUp = async () => {
    if (finalAmount < 1) {
      setError('Minimum top-up amount is $1.00')
      return
    }

    if (finalAmount > 1000) {
      setError('Maximum top-up amount is $1,000.00')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
      
      // Create a form and submit it to redirect to PayPal
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = '/dashboard/wallet/top-up'
      
      const amountInput = document.createElement('input')
      amountInput.type = 'hidden'
      amountInput.name = 'amount'
      amountInput.value = finalAmount.toString()
      
      const csrfInput = document.createElement('input')
      csrfInput.type = 'hidden'
      csrfInput.name = '_token'
      csrfInput.value = csrfToken
      
      form.appendChild(amountInput)
      form.appendChild(csrfInput)
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process top-up')
      setIsProcessing(false)
    }
  }

  const isValidAmount = finalAmount >= 1 && finalAmount <= 1000

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Top Up Your Wallet
          </DialogTitle>
          <DialogDescription>
            Add funds to your wallet using PayPal. Secure and instant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preset Amounts */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Quick Select</Label>
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset.toString() ? 'default' : 'outline'}
                  className={`${amount === preset.toString() ? 'bg-[#05ADA3] hover:bg-[#048e86]' : ''}`}
                  onClick={() => handlePresetSelect(preset)}
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="custom-amount" className="text-sm font-medium mb-2 block">
              Or Enter Custom Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="custom-amount"
                type="number"
                min="1"
                max="1000"
                step="0.01"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Minimum: $1.00 • Maximum: $1,000.00
            </p>
          </div>

          {/* Selected Amount Display */}
          {finalAmount > 0 && (
            <div className="bg-[#05ADA3]/10 border-2 border-[#05ADA3] rounded-lg p-4 text-center">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-3xl font-bold text-[#05ADA3] mt-1">
                ${finalAmount.toFixed(2)}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Wallet topped up successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleTopUp}
              disabled={!isValidAmount || isProcessing}
              className="flex-1 bg-[#05ADA3] hover:bg-[#048e86]"
            >
              {isProcessing ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Processing...
                </>
              ) : (
                <>Pay with PayPal</>
              )}
            </Button>
          </div>

          {/* Payment Info */}
          <div className="text-xs text-center text-muted-foreground">
            You will be redirected to PayPal to complete the transaction
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
