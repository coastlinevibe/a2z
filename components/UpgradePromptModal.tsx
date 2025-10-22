'use client'

import { useState } from 'react'
import { X, Zap, Crown, Users, Check } from 'lucide-react'
import Link from 'next/link'
import { formatPrice, TIER_PRICING, EARLY_ADOPTER_PRICING } from '@/lib/subscription'

interface UpgradePromptModalProps {
  isOpen: boolean
  onClose: () => void
  trigger: 'reset' | 'limit_reached' | 'feature_locked'
  title?: string
  message?: string
}

export default function UpgradePromptModal({ 
  isOpen, 
  onClose, 
  trigger,
  title,
  message 
}: UpgradePromptModalProps) {
  const [selectedTier, setSelectedTier] = useState<'premium' | 'business'>('premium')
  const isEarlyAdopter = true // This would come from user context

  if (!isOpen) return null

  const getDefaultContent = () => {
    switch (trigger) {
      case 'reset':
        return {
          title: 'Your 7-Day Cycle Has Reset',
          message: 'All your listings and images have been cleared. Upgrade to Premium for 35-day visibility and keep your content longer.'
        }
      case 'limit_reached':
        return {
          title: 'Free Limit Reached',
          message: 'You\'ve reached your free tier limits. Upgrade to Premium for unlimited listings and more features.'
        }
      case 'feature_locked':
        return {
          title: 'Premium Feature',
          message: 'This feature is available with Premium. Upgrade now to unlock all advanced tools.'
        }
      default:
        return {
          title: 'Upgrade to Premium',
          message: 'Get more features and better visibility for your listings.'
        }
    }
  }

  const content = {
    title: title || getDefaultContent().title,
    message: message || getDefaultContent().message
  }

  const premiumFeatures = [
    'Unlimited listings',
    '8 images + videos per listing',
    '35-day listing duration',
    'Verified seller badge ✓',
    'Premium gallery types',
    'No watermark',
    'Advanced analytics'
  ]

  const businessFeatures = [
    'Everything in Premium',
    '20 images + videos per listing',
    '60-day listing duration',
    'Custom branding',
    'Team collaboration',
    'API access',
    'Priority support'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
            <p className="text-gray-600 mt-1">{content.message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Early Adopter Banner */}
        {isEarlyAdopter && (
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-4 m-6 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Early Adopter Special</span>
            </div>
            <p className="text-sm opacity-90">
              You're one of the first 500 users! Get up to 45% off for 12 months.
            </p>
          </div>
        )}

        {/* Tier Selection */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Premium Tier */}
            <div 
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedTier === 'premium' 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
              onClick={() => setSelectedTier('premium')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-emerald-500" />
                  <h3 className="text-xl font-bold text-gray-900">Premium</h3>
                </div>
                {selectedTier === 'premium' && (
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(isEarlyAdopter ? EARLY_ADOPTER_PRICING.premium.monthly : TIER_PRICING.premium.monthly)}
                </div>
                <div className="text-gray-600">/month</div>
                {isEarlyAdopter && (
                  <div className="text-sm text-emerald-600 font-medium">
                    45% off the first 500 Premium accounts • Then just {formatPrice(TIER_PRICING.premium.monthly)}/month regular price
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Tier */}
            <div 
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                selectedTier === 'business' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedTier('business')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold text-gray-900">Business</h3>
                </div>
                {selectedTier === 'business' && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(isEarlyAdopter ? EARLY_ADOPTER_PRICING.business.monthly : TIER_PRICING.business.monthly)}
                </div>
                <div className="text-gray-600">/month</div>
                {isEarlyAdopter && (
                  <div className="text-sm text-blue-600 font-medium">
                    45% off for 12 months • Then {formatPrice(TIER_PRICING.business.monthly)}/month regular price
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {businessFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Maybe Later
            </button>
            <Link
              href={`/auth/signup-animated?plan=${selectedTier}`}
              className={`flex-1 py-3 px-6 text-white rounded-lg transition-colors text-center font-medium ${
                selectedTier === 'premium' 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
              onClick={() => {
                // Track upgrade click for analytics
                console.log(`User clicked upgrade to ${selectedTier} from ${trigger} prompt`)
                onClose()
              }}
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Upgrade to {selectedTier === 'premium' ? 'Premium' : 'Business'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
