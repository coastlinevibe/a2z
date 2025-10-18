'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Phone, MapPin, Eye, MousePointer, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatPrice, generateWhatsAppUrl } from '@/lib/utils'
import { usePageView, trackWhatsAppClick, trackPhoneClick } from '@/lib/analytics'
import { HoverGallery } from './HoverGallery'
import { HorizontalSlider } from './HorizontalSlider'
import { VerticalSlider } from './VerticalSlider'
import { PremiumGallery } from './PremiumGallery'

interface Post {
  id: string
  title: string
  price_cents: number
  currency: string
  description?: string | null
  emoji_tags: string[]
  media_urls: string[]
  media_descriptions?: string[]
  whatsapp_number?: string | null
  location?: string | null
  display_type?: string | null
  views: number
  clicks: number
  created_at: string
}

interface PostCardProps {
  post: Post
  showStats?: boolean
  onWhatsAppClick?: () => void
  onCallClick?: () => void
  trackViews?: boolean
  className?: string
}

export function PostCard({ 
  post, 
  showStats = false, 
  onWhatsAppClick, 
  onCallClick,
  trackViews = false,
  className 
}: PostCardProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  // Track page views if enabled
  usePageView(trackViews ? post.id : null)

  const handleWhatsAppClick = () => {
    trackWhatsAppClick(post.id)
    onWhatsAppClick?.()
    
    if (post.whatsapp_number) {
      const message = `Hi! I'm interested in "${post.title}" for ${formatPrice(post.price_cents, post.currency)}`
      const whatsappUrl = generateWhatsAppUrl(post.whatsapp_number, message)
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleCallClick = () => {
    trackPhoneClick(post.id)
    onCallClick?.()
    
    if (post.whatsapp_number) {
      window.open(`tel:${post.whatsapp_number}`, '_self')
    }
  }

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev === post.media_urls.length - 1 ? 0 : prev + 1
    )
  }

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev === 0 ? post.media_urls.length - 1 : prev - 1
    )
  }

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('video')
  }

  return (
    <div className={cn(
      'bg-white rounded-xl shadow-lg overflow-hidden mx-auto relative',
      post.display_type === 'vertical' ? 'max-w-2xl' : 'max-w-md',
      className
    )}>
      {/* Gallery - render based on display_type */}
      <div className="group relative">
        {post.display_type === 'slider' ? (
          <HorizontalSlider images={post.media_urls} alt={post.title} className="rounded-t-xl" />
        ) : post.display_type === 'vertical' ? (
          <VerticalSlider images={post.media_urls} alt={post.title} className="rounded-t-xl" />
        ) : post.display_type === 'premium' ? (
          <PremiumGallery images={post.media_urls} descriptions={post.media_descriptions} className="rounded-t-xl" />
        ) : (
          <HoverGallery 
            images={post.media_urls}
            alt={post.title}
            aspectRatio="square"
            className="rounded-t-xl"
          />
        )}
        {/* Price badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-emerald-500 text-white px-3 py-1 rounded-full font-bold text-lg shadow-lg">
            {formatPrice(post.price_cents, post.currency)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {post.title}
        </h2>

        {/* Emoji tags */}
        {post.emoji_tags && post.emoji_tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {(post.emoji_tags || []).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {post.description && (
          <p className="text-gray-600 mb-4 leading-relaxed">
            {post.description}
          </p>
        )}

        {/* Location */}
        {post.location && (
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {post.location}
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {post.views} views
            </div>
            <div className="flex items-center">
              <MousePointer className="h-4 w-4 mr-1" />
              {post.clicks} clicks
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleWhatsAppClick}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Contact Seller
          </button>
          
          {post.whatsapp_number && (
            <button
              onClick={handleCallClick}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              title="Call seller"
            >
              <Phone className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-400 mt-4 text-center">
          Posted {new Date(post.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
