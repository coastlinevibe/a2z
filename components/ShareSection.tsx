'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'

interface ShareSectionProps {
  post: {
    title: string
    price_cents: number
    currency: string
    slug: string
  }
  username: string
}

export function ShareSection({ post, username }: ShareSectionProps) {
  const [copied, setCopied] = useState(false)

  const baseUrl = process.env.NEXT_PUBLIC_SELLR_BASE_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3004')
  const publicUrl = `${baseUrl}/${username}/${post.slug}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Share This Listing
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Copy Link
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={publicUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp Message
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {`${post.title} — ${formatPrice(post.price_cents, post.currency)}\n${publicUrl}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
