'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { X, CreditCard, Building2, Smartphone, Check } from 'lucide-react'
import { PRICING, formatPrice } from '@/lib/payments/config'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  tier: 'premium' | 'business'
  isEarlyAdopter?: boolean
}

export function PaymentModal({ isOpen, onClose, tier, isEarlyAdopter = false }: PaymentModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<'payfast' | 'eft'>('payfast')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const tierInfo = PRICING[tier]
  const amount = isEarlyAdopter && 'earlyAdopterPrice' in tierInfo 
    ? tierInfo.earlyAdopterPrice 
    : tierInfo.price

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, provider: selectedProvider })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      // Redirect to payment URL
      window.location.href = data.paymentUrl

    } catch (err: any) {
      setError(err.message || 'Payment failed')
      setLoading(false)
    }
  }

  const providers = [
    {
      id: 'payfast' as const,
      name: 'PayFast',
      description: 'Credit card, Instant EFT, SnapScan',
      icon: CreditCard,
      recommended: true
    },
    {
      id: 'eft' as const,
      name: 'Manual EFT',
      description: 'Direct bank transfer (1-2 days)',
      icon: Building2,
      recommended: false
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Upgrade to {tierInfo.name}
            </h2>
            <p className="text-gray-600 mt-1">Choose your payment method</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pricing Summary */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{tierInfo.name} Plan</h3>
                <p className="text-sm text-gray-600">Billed monthly</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-600">
                  {formatPrice(amount)}
                </div>
                <p className="text-sm text-gray-600">/month</p>
              </div>
            </div>

            {isEarlyAdopter && (
              <Badge className="bg-amber-500 text-white">
                🎉 Early Adopter Discount Applied!
              </Badge>
            )}

            <div className="mt-4 space-y-2">
              {tierInfo.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-emerald-600" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Select Payment Method</h3>
            <div className="space-y-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedProvider === provider.id
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      selectedProvider === provider.id
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <provider.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{provider.name}</span>
                        {provider.recommended && (
                          <Badge className="bg-emerald-500 text-white text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{provider.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedProvider === provider.id
                        ? 'border-emerald-500 bg-emerald-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedProvider === provider.id && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay ${formatPrice(amount)}`}
            </Button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-gray-500 text-center">
            🔒 Secure payment powered by PayFast. Your payment information is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  )
}
