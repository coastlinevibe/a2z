'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Star, Crown, Users, ArrowRight } from 'lucide-react'
import { TIER_PRICING, EARLY_ADOPTER_PRICING, formatPrice } from '@/lib/subscription'

export default function ChoosePlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium' | 'business'>('free')
  const isEarlyAdopter = true

  const getSignupUrl = (plan: 'free' | 'premium' | 'business') => {
    return `/auth/signup-animated?plan=${plan}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full mb-8 font-semibold shadow-lg">
            <Star className="w-5 h-5" />
            <span>🎉 Early Adopter: Up to 45% off for 12 months!</span>
            <Star className="w-5 h-5" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start with our free plan and upgrade anytime. No setup fees, no contracts, no surprises.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div 
            className={`bg-white rounded-2xl border-2 p-8 cursor-pointer transition-all ${
              selectedPlan === 'free' 
                ? 'border-emerald-500 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedPlan('free')}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect to get started</p>
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
                <span className="text-gray-700">7-day listing duration</span>
              </div>
            </div>

            <div className="text-center">
              <div className={`w-6 h-6 rounded-full border-2 mx-auto ${
                selectedPlan === 'free' 
                  ? 'border-emerald-500 bg-emerald-500' 
                  : 'border-gray-300'
              }`}>
                {selectedPlan === 'free' && (
                  <Check className="w-4 h-4 text-white m-0.5" />
                )}
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div 
            className={`bg-white rounded-2xl border-2 p-8 cursor-pointer transition-all relative ${
              selectedPlan === 'premium' 
                ? 'border-emerald-500 shadow-lg scale-105' 
                : 'border-emerald-500 hover:shadow-lg'
            }`}
            onClick={() => setSelectedPlan('premium')}
          >
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
                  {formatPrice(isEarlyAdopter ? EARLY_ADOPTER_PRICING.premium.monthly : TIER_PRICING.premium.monthly)}
                </div>
                <div className="text-gray-600">/month</div>
              </div>

              {isEarlyAdopter && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  41% off for 12 months • Then {formatPrice(TIER_PRICING.premium.monthly)}
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
                <span className="text-gray-700">8 images + videos</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">Verified seller badge ✓</span>
              </div>
            </div>

            <div className="text-center">
              <div className={`w-6 h-6 rounded-full border-2 mx-auto ${
                selectedPlan === 'premium' 
                  ? 'border-emerald-500 bg-emerald-500' 
                  : 'border-gray-300'
              }`}>
                {selectedPlan === 'premium' && (
                  <Check className="w-4 h-4 text-white m-0.5" />
                )}
              </div>
            </div>
          </div>

          {/* Business Plan */}
          <div 
            className={`bg-white rounded-2xl border-2 p-8 cursor-pointer transition-all ${
              selectedPlan === 'business' 
                ? 'border-blue-500 shadow-lg scale-105' 
                : 'border-blue-500 hover:shadow-lg'
            }`}
            onClick={() => setSelectedPlan('business')}
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-6 h-6 text-blue-500" />
                <h3 className="text-2xl font-bold text-gray-900">Business</h3>
              </div>
              <p className="text-gray-600 mb-6">For professionals</p>
              
              <div className="mb-4">
                <div className="text-4xl font-bold text-gray-900">
                  {formatPrice(isEarlyAdopter ? EARLY_ADOPTER_PRICING.business.monthly : TIER_PRICING.business.monthly)}
                </div>
                <div className="text-gray-600">/month</div>
              </div>

              {isEarlyAdopter && (
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  45% off for 12 months • Then {formatPrice(TIER_PRICING.business.monthly)}
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
                <span className="text-gray-700">20 images + videos</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-gray-700">Custom branding</span>
              </div>
            </div>

            <div className="text-center">
              <div className={`w-6 h-6 rounded-full border-2 mx-auto ${
                selectedPlan === 'business' 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
              }`}>
                {selectedPlan === 'business' && (
                  <Check className="w-4 h-4 text-white m-0.5" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Link
            href={getSignupUrl(selectedPlan)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-4 px-8 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all shadow-lg"
          >
            Continue with {selectedPlan === 'free' ? 'Free' : selectedPlan === 'premium' ? 'Premium' : 'Business'} Plan
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
