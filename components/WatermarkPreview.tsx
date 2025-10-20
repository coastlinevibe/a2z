'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Droplet, AlertCircle, CheckCircle } from 'lucide-react'

interface WatermarkPreviewProps {
  subscriptionTier: string | null
  showWarning?: boolean
}

export function WatermarkPreview({ subscriptionTier, showWarning = true }: WatermarkPreviewProps) {
  const [shouldWatermark, setShouldWatermark] = useState(false)

  useEffect(() => {
    setShouldWatermark(subscriptionTier === 'free' || subscriptionTier === null)
  }, [subscriptionTier])

  if (!shouldWatermark) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Droplet className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-blue-900">Watermark Applied</h4>
            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
              Free Tier
            </Badge>
          </div>
          <p className="text-sm text-blue-800 mb-2">
            Your images will have an "A2Z.co.za" watermark in the bottom-right corner.
          </p>
          {showWarning && (
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <AlertCircle className="w-4 h-4" />
              <span>Upgrade to Premium to remove watermarks</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function WatermarkStatus({ subscriptionTier }: { subscriptionTier: string | null }) {
  const hasWatermark = subscriptionTier === 'free' || subscriptionTier === null

  return (
    <div className={`flex items-center gap-2 text-sm ${
      hasWatermark ? 'text-amber-600' : 'text-emerald-600'
    }`}>
      {hasWatermark ? (
        <>
          <Droplet className="w-4 h-4" />
          <span>Watermark will be added</span>
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4" />
          <span>No watermark</span>
        </>
      )}
    </div>
  )
}

export function WatermarkUpgradePrompt() {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Droplet className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Remove Watermarks with Premium
          </h3>
          <p className="text-gray-700 mb-4">
            Upgrade to Premium or Business to upload images without watermarks and showcase your listings professionally.
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>No watermarks on any images</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Professional appearance</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Unlimited listings</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Verified seller badge</span>
            </div>
          </div>
          <a
            href="/pricing"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Upgrade Now
          </a>
        </div>
      </div>
    </div>
  )
}

interface WatermarkExampleProps {
  imageUrl: string
}

export function WatermarkExample({ imageUrl }: WatermarkExampleProps) {
  return (
    <div className="relative inline-block">
      <img
        src={imageUrl}
        alt="Example with watermark"
        className="rounded-lg"
      />
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded text-sm font-semibold text-gray-700 shadow-lg">
        A2Z.co.za
      </div>
    </div>
  )
}
