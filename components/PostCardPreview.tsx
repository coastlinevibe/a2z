'use client'

import { useState } from 'react'
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { HoverGallery } from './HoverGallery'
import { HorizontalSlider } from './HorizontalSlider'

interface Post {
  id: string
  title: string
  price_cents: number
  currency: string
  description?: string | null
  emoji_tags: string[]
  media_urls: string[]
  whatsapp_number?: string | null
  location?: string | null
}

interface PostCardPreviewProps {
  post: Post
  layout?: 'square' | 'portrait' | 'landscape'
  displayType?: 'hover' | 'slider'
  className?: string
}

export function PostCardPreview({ 
  post, 
  layout = 'square',
  displayType = 'hover',
  className 
}: PostCardPreviewProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

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

  const getAspectClass = () => {
    switch (layout) {
      case 'portrait':
        return 'aspect-[3/4]'
      case 'landscape':
        return 'aspect-[4/3]'
      default:
        return 'aspect-square'
    }
  }

  const getObjectFit = () => {
    return layout === 'square' ? 'object-contain' : 'object-cover'
  }

  return (
    <div className={cn(
      'bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto',
      className
    )}>
      {/* Image Display */}
      <div className="group">
        {displayType === 'hover' ? (
          <HoverGallery 
            images={post.media_urls}
            alt={post.title}
            aspectRatio={layout}
            className="rounded-t-xl"
          />
        ) : (
          <HorizontalSlider 
            images={post.media_urls}
            alt={post.title}
            className="rounded-t-xl"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {formatPrice(post.price_cents, post.currency)}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* Emoji tags */}
        {post.emoji_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.emoji_tags.map((emoji, index) => (
              <span key={index} className="text-lg">
                {emoji}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {post.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {post.description}
          </p>
        )}

        {/* WhatsApp button */}
        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Chat on WhatsApp</span>
        </button>
      </div>
    </div>
  )
}
