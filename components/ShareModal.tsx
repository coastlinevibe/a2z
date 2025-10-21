'use client'

import { useState } from 'react'
import { X, Copy, Check, ExternalLink } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  post: {
    title: string
    price_cents: number
    currency: string
    slug: string
    username?: string
  }
  username?: string
  className?: string
}

export function ShareModal({ isOpen, onClose, post, username, className }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Prefer explicit env; otherwise use current origin in the browser.
  const baseUrl =
    process.env.NEXT_PUBLIC_SELLR_BASE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3004')
  
  // Use the actual username from profile (not the UUID-based slug)
  const userSlug = username || post.username
  
  // Debug logging
  console.log('ShareModal Debug:', {
    username,
    postUsername: post.username,
    userSlug,
    slug: post.slug
  })
  
  const publicUrl = userSlug ? `${baseUrl}/${userSlug}/${post.slug}` : `${baseUrl}/p/${post.slug}`
  const price = formatPrice(post.price_cents, post.currency)
  const shareMessage = `${post.title} — ${price}\n${publicUrl}`

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openPublicPage = () => {
    window.open(publicUrl, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={cn(
        'bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Share Your Listing
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Public URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={publicUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button
              onClick={() => copyToClipboard(publicUrl)}
              className="w-full flex items-center justify-center px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          {/* Share message preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Text (Optional)
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {shareMessage}
              </pre>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-emerald-900 mb-2">
              💡 Sharing Tips
            </h4>
            <ul className="text-sm text-emerald-800 space-y-1">
              <li>• Share your link on WhatsApp, Facebook, Instagram, or SMS</li>
              <li>• Post in relevant groups and communities for better reach</li>
              <li>• Add a personal message to build trust with buyers</li>
              <li>• Update your listing anytime if details change</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
