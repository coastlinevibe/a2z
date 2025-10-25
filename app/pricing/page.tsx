'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, Star, Zap, Crown, Users } from 'lucide-react'
import { TIER_PRICING, EARLY_ADOPTER_PRICING, formatPrice } from '@/lib/subscription'
import { MovingBorderButton } from '@/components/ui/moving-border'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const isEarlyAdopter = true // For first 500 users

  const getPrice = (tier: 'premium' | 'business', cycle: 'monthly' | 'annual') => {
    if (isEarlyAdopter && cycle === 'monthly') {
      return EARLY_ADOPTER_PRICING[tier].monthly
    }
    return TIER_PRICING[tier][cycle]
  }

  const getAnnualSavings = (tier: 'premium' | 'business') => {
    const monthly = TIER_PRICING[tier].monthly * 12
    const annual = TIER_PRICING[tier].annual
    return monthly - annual
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simple Pricing for Every Seller
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Start free, upgrade when you're ready. No hidden fees, no commissions.
            Just beautiful listings that convert.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto mb-8">
            <p className="text-blue-800 font-medium text-center">
              🧪 Currently in Free Plan Testing Phase
            </p>
            <p className="text-blue-700 text-sm text-center mt-1">
              Premium and Business signups are temporarily disabled while we perfect the free experience. 
              Feel free to test our platform with a free account!
            </p>
          </div>

          {/* Early Adopter Banner */}
          <div className="flex justify-center mb-8">
            <MovingBorderButton
              borderRadius="1rem"
              duration={4000}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3"
              containerClassName="inline-block"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5" />
                <span className="font-semibold">Early Adopter: 45% off the first 500 Premium accounts • Then just R49/month regular price.</span>
                <Link href="/auth/signup-animated?plan=free">
                  <button className="ml-2 inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-400">
                    Try Free Plan Now!
                  </button>
                </Link>
              </div>
            </MovingBorderButton>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-sm font-medium">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Try it out</p>
              <div className="text-4xl font-bold text-gray-900 mb-2">R0</div>
              <div className="text-gray-600">Forever free</div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">3 active listings</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">5 images per listing</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">Basic gallery types</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">WhatsApp integration</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">Basic analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500">7-day listing duration</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-500">A2z watermark</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/auth/signup-animated?plan=free"
                className="w-full py-3 px-6 border-2 border-emerald-300 text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors inline-block text-center font-medium"
              >
                Get Started Free
              </Link>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-emerald-800 font-medium text-xs text-center">
                  ✨ Perfect for testing!
                </p>
                <p className="text-emerald-700 text-xs text-center mt-1">
                  Feel free to explore all features
                </p>
              </div>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500 p-8 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                Most Popular
              </div>
            </div>

            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-emerald-500" />
                <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
              </div>
              <p className="text-gray-600 mb-6">For serious sellers</p>
              
              <div className="mb-4">
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(getPrice('premium', billingCycle))}
                </div>
                <div className="text-gray-600">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </div>
              </div>

              {billingCycle === 'monthly' && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  45% off the first 500 Premium accounts • Then just {formatPrice(TIER_PRICING.premium.monthly)}/month regular price
                </div>
              )}

              {billingCycle === 'annual' && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  Save {formatPrice(getAnnualSavings('premium'))} per year
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">Unlimited listings</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">8 images per listing</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">Verified seller badge ✓</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">35-day listing duration</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">Video support</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">Premium gallery types</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">No watermark</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                disabled
                className="w-full py-3 px-6 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-60 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Start Premium
              </button>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 font-medium text-xs text-center">
                  🧪 Testing in progress
                </p>
                <p className="text-blue-700 text-xs text-center mt-1">
                  Premium signup temporarily disabled
                </p>
              </div>
            </div>
          </div>

          {/* Business Tier */}
          <div className="bg-white rounded-2xl border-2 border-blue-500 p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-blue-500" />
                <h3 className="text-2xl font-bold text-gray-900">Business</h3>
              </div>
              <p className="text-gray-600 mb-6">For professionals</p>
              
              <div className="mb-4">
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(getPrice('business', billingCycle))}
                </div>
                <div className="text-gray-600">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </div>
              </div>

              {billingCycle === 'monthly' && (
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  45% off for 12 months • Then {formatPrice(TIER_PRICING.business.monthly)}
                </div>
              )}

              {billingCycle === 'annual' && (
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  Save {formatPrice(getAnnualSavings('business'))} per year
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Everything in Premium</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">20 images per listing</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Multiple videos</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Custom branding</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Team collaboration (3 users)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">API access</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">60-day listing duration</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Priority support</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                disabled
                className="w-full py-3 px-6 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-60 text-center"
              >
                Start Business
              </button>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 font-medium text-xs text-center">
                  🧪 Testing in progress
                </p>
                <p className="text-blue-700 text-xs text-center mt-1">
                  Business signup temporarily disabled
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept EFT, SnapScan, Zapper, and card payments via PayFast.
                All payments are processed securely in South African Rand (ZAR).
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. Your listings will remain active until 
                the end of your billing period, after which they'll be converted to free tier limits.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my listings if I downgrade?
              </h3>
              <p className="text-gray-600">
                Your existing listings will remain active, but you won't be able to create new ones 
                beyond the free tier limit (3 listings) until you upgrade again or deactivate some listings.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you charge transaction fees?
              </h3>
              <p className="text-gray-600">
                No! Unlike other marketplaces, we don't charge any transaction fees or commissions. 
                You keep 100% of your sales. We only charge the monthly subscription fee.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does the early adopter pricing work?
              </h3>
              <p className="text-gray-600">
                The first 500 users get special pricing for 12 months: Premium for R29/month (41% off) and 
                Business for R99/month (45% off). After 12 months, your subscription automatically continues 
                at regular pricing (R49/month for Premium, R179/month for Business). You can cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
