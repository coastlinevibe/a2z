'use client'

import { useState } from 'react'
import { X, Check, Star, Zap } from 'lucide-react'
import { TIER_PRICING, EARLY_ADOPTER_PRICING, formatPrice } from '@/lib/subscription'

interface TierUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier: 'free' | 'premium' | 'business'
  onUpgrade: (tier: 'premium' | 'business', billingCycle: 'monthly' | 'quarterly' | 'annual') => void
}

export default function TierUpgradeModal({ 
  isOpen, 
  onClose, 
  currentTier, 
  onUpgrade 
}: TierUpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<'premium' | 'business'>('premium')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>('monthly')
  const [isEarlyAdopter] = useState(true) // For first 500 users

  if (!isOpen) return null

  const getPrice = (tier: 'premium' | 'business', cycle: 'monthly' | 'quarterly' | 'annual') => {
    if (isEarlyAdopter && cycle === 'monthly') {
      return EARLY_ADOPTER_PRICING[tier].monthly
    }
    return TIER_PRICING[tier][cycle]
  }

  const getSavings = (tier: 'premium' | 'business', cycle: 'quarterly' | 'annual') => {
    const monthly = TIER_PRICING[tier].monthly
    const discounted = TIER_PRICING[tier][cycle]
    const months = cycle === 'quarterly' ? 3 : 12
    const regularTotal = monthly * months
    return regularTotal - discounted
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl max-w-sm sm:max-w-2xl lg:max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Unlock more features and grow your business</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Early Adopter Banner */}
        {isEarlyAdopter && (
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-3 sm:p-4 m-4 sm:m-6 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-sm sm:text-base">Early Adopter Special</span>
            </div>
            <p className="text-xs sm:text-sm opacity-90">
              You're one of the first 500 users! Get up to 45% off your Premium plan—after 12 months it continues at R49/month.
            </p>
          </div>
        )}

        {/* Tier Selection */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Premium Tier */}
            <div 
              className={`border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all ${
                selectedTier === 'premium' 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTier('premium')}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Premium</h3>
                  <p className="text-sm sm:text-base text-gray-600">Most Popular</p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                  {selectedTier === 'premium' && (
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                  <span>Unlimited listings</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                  <span>8 images per listing</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                  <span>Verified seller badge ✓</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                  <span>35-day listing duration</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                  <span>Video support</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                  <span>Advanced analytics</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatPrice(getPrice('premium', billingCycle))}
                  <span className="text-xs sm:text-sm font-normal text-gray-600">
                    /{billingCycle === 'quarterly' ? '3 months' : billingCycle.slice(0, -2)}
                  </span>
                </div>
                {isEarlyAdopter && billingCycle === 'monthly' && (
                  <div className="text-xs sm:text-sm text-emerald-600 font-medium">
                    41% off • Was {formatPrice(TIER_PRICING.premium.monthly)}
                  </div>
                )}
              </div>
            </div>

            {/* Business Tier */}
            <div 
              className={`border-2 rounded-xl p-4 sm:p-6 cursor-pointer transition-all ${
                selectedTier === 'business' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTier('business')}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Business</h3>
                  <p className="text-sm sm:text-base text-gray-600">For Professionals</p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center">
                  {selectedTier === 'business' && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span>Everything in Premium</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span>20 images per listing</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span>Multiple videos</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span>Custom branding</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span>Team collaboration (3 users)</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  <span>API access</span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatPrice(getPrice('business', billingCycle))}
                  <span className="text-xs sm:text-sm font-normal text-gray-600">
                    /{billingCycle === 'quarterly' ? '3 months' : billingCycle.slice(0, -2)}
                  </span>
                </div>
                {isEarlyAdopter && billingCycle === 'monthly' && (
                  <div className="text-xs sm:text-sm text-blue-600 font-medium">
                    45% off for 12 months • Then {formatPrice(TIER_PRICING.business.monthly)} / month
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Billing Cycle Selection */}
          <div className="mb-6 sm:mb-8">
            <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Billing Cycle</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`p-3 sm:p-4 rounded-lg border-2 text-center transition-all ${
                  billingCycle === 'monthly'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm sm:text-base">Monthly</div>
                <div className="text-xs sm:text-sm text-gray-600">Pay monthly</div>
                {isEarlyAdopter && (
                  <div className="text-xs text-emerald-600 font-medium mt-1">
                    Early adopter price
                  </div>
                )}
              </button>

              <button
                onClick={() => setBillingCycle('quarterly')}
                className={`p-3 sm:p-4 rounded-lg border-2 text-center transition-all ${
                  billingCycle === 'quarterly'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm sm:text-base">Quarterly</div>
                <div className="text-xs sm:text-sm text-gray-600">10% discount</div>
                <div className="text-xs text-emerald-600 font-medium mt-1">
                  Save {formatPrice(getSavings(selectedTier, 'quarterly'))}
                </div>
              </button>

              <button
                onClick={() => setBillingCycle('annual')}
                className={`p-3 sm:p-4 rounded-lg border-2 text-center transition-all ${
                  billingCycle === 'annual'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-sm sm:text-base">Annual</div>
                <div className="text-xs sm:text-sm text-gray-600">20% discount</div>
                <div className="text-xs text-emerald-600 font-medium mt-1">
                  Save {formatPrice(getSavings(selectedTier, 'annual'))}
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-4 sm:px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Maybe Later
            </button>
            <button
              onClick={() => onUpgrade(selectedTier, billingCycle)}
              className="w-full sm:flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              Upgrade to {selectedTier === 'premium' ? 'Premium' : 'Business'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
