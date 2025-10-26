'use client'

import { useState, useEffect } from 'react'
import { Crown, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { TierLimits, getUserTierLimits, getTierDisplayName, getTierColor } from '@/lib/subscription'
import TierUpgradeModal from './TierUpgradeModal'

interface TierLimitsCardProps {
  onUpgrade?: () => void
  initialTierLimits?: TierLimits | null
  loading?: boolean
  onTierLimitsRefresh?: (limits: TierLimits | null) => void
}

export default function TierLimitsCard({
  onUpgrade,
  initialTierLimits,
  loading: externalLoading,
  onTierLimitsRefresh,
}: TierLimitsCardProps) {
  const manageOwnState = initialTierLimits === undefined
  const [limits, setLimits] = useState<TierLimits | null>(initialTierLimits ?? null)
  const [loading, setLoading] = useState(manageOwnState ? true : externalLoading ?? false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (manageOwnState) {
      loadTierLimits()
    }
  }, [manageOwnState])

  useEffect(() => {
    if (!manageOwnState) {
      setLimits(initialTierLimits ?? null)
    }
  }, [initialTierLimits, manageOwnState])

  useEffect(() => {
    if (!manageOwnState) {
      setLoading(externalLoading ?? false)
    }
  }, [externalLoading, manageOwnState])

  const loadTierLimits = async () => {
    try {
      const tierLimits = await getUserTierLimits()
      setLimits(tierLimits)
      onTierLimitsRefresh?.(tierLimits)
    } catch (error) {
      console.error('Error loading tier limits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = (tier: 'premium' | 'business', billingCycle: 'monthly' | 'quarterly' | 'annual') => {
    setShowUpgradeModal(false)
    if (onUpgrade) {
      onUpgrade()
    }
    // Here you would integrate with your payment processor
    console.log('Upgrading to:', tier, billingCycle)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!limits) {
    return null
  }

  const usagePercentage = limits.max_listings === -1 
    ? 0 
    : (limits.current_listings / limits.max_listings) * 100

  const isNearLimit = usagePercentage >= 80
  const isAtLimit = !limits.can_create_listing

  return (
    <>
      <div className="bg-white rounded-lg border p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Crown className={`w-5 h-5 ${getTierColor(limits.tier)}`} />
            <h3 className="font-semibold text-gray-900">
              {getTierDisplayName(limits.tier)} Plan
            </h3>
            {limits.verified_badge && (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          {limits.tier === 'free' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm rounded-full hover:from-emerald-600 hover:to-blue-600 transition-all"
            >
              Upgrade
            </button>
          )}
        </div>

        {/* Usage Stats */}
        <div className="space-y-3">
          {/* Listings Usage */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Active Listings</span>
              <span className="text-sm font-medium">
                {limits.current_listings}
                {limits.max_listings === -1 ? '' : ` / ${limits.max_listings}`}
              </span>
            </div>
            {limits.max_listings !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isAtLimit 
                      ? 'bg-red-500' 
                      : isNearLimit 
                      ? 'bg-yellow-500' 
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t">
            <div className="text-center">
              <div className="text-base font-semibold text-gray-900">
                {limits.max_images}
              </div>
              <div className="text-xs text-gray-600">Images per listing</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold text-gray-900">
                {limits.max_videos === -1 ? '∞' : limits.max_videos}
              </div>
              <div className="text-xs text-gray-600">Videos per listing</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold text-gray-900">
                {limits.listing_duration_days}
              </div>
              <div className="text-xs text-gray-600">Days duration</div>
            </div>
            <div className="text-center">
              <div className="text-base font-semibold text-gray-900">
                {limits.gallery_types.length}
              </div>
              <div className="text-xs text-gray-600">Gallery types</div>
            </div>
          </div>

          {/* Warnings */}
          {isAtLimit && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-medium text-red-800">Listing limit reached</div>
                <div className="text-red-600">
                  Upgrade to create more listings or deactivate existing ones.
                </div>
              </div>
            </div>
          )}

          {isNearLimit && !isAtLimit && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-medium text-yellow-800">Approaching limit</div>
                <div className="text-yellow-600">
                  You're using {Math.round(usagePercentage)}% of your listings.
                </div>
              </div>
            </div>
          )}

          {/* Upgrade CTA for Free Users */}
          {limits.tier === 'free' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full mt-2 p-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-md hover:from-emerald-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Zap className="w-4 h-4" />
              Unlock Unlimited Listings
            </button>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <TierUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={limits.tier}
        onUpgrade={handleUpgrade}
      />
    </>
  )
}
