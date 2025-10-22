'use client'

import { useState } from 'react'
import { Eye, MousePointer, X, Phone, MapPin } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { PostCard } from './PostCard'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { PremiumGallery } from '@/components/PremiumGallery'
import { HorizontalSlider } from '@/components/HorizontalSlider'
import { VerticalSlider } from '@/components/VerticalSlider'
import { HoverGallery } from '@/components/HoverGallery'
import SimpleVideoPlayer from '@/components/ui/SimpleVideoPlayer'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'

interface Post {
  id: string
  title: string
  price_cents: number
  currency: string
  description?: string | null
  emoji_tags: string[]
  media_urls: string[]
  media_descriptions?: string[]
  slug: string
  is_active: boolean
  whatsapp_number?: string | null
  location?: string | null
  display_type?: string | null
  views: number
  clicks: number
  created_at: string
  updated_at: string
}

interface ListingCardGridProps {
  posts: Post[]
  onEdit?: (postId: string) => void
  onShare?: (post: Post) => void
  onPreview?: (post: Post) => void
  onDelete?: (postId: string) => void
}

export function ListingCardGrid({ posts, onEdit, onShare, onPreview, onDelete }: ListingCardGridProps) {
  const [expandedPost, setExpandedPost] = useState<Post | null>(null)
  const [openCardId, setOpenCardId] = useState<string>('')

  const openGallery = (post: Post) => {
    setExpandedPost(post)
  }

  const closeGallery = () => {
    setExpandedPost(null)
  }

  const handleContactSeller = (post: Post) => {
    const contactNumber = post.whatsapp_number || '0000000000'
    const message = encodeURIComponent(`Hi, I'm interested in: ${post.title}`)
    window.open(`https://wa.me/${contactNumber}?text=${message}`, '_blank')
  }

  const handleCallSeller = (post: Post) => {
    const contactNumber = post.whatsapp_number || '0000000000'
    window.location.href = `tel:${contactNumber}`
  }

  const renderMedia = (post: Post) => {
    if (!post.media_urls || post.media_urls.length === 0) {
      return (
        <div className="w-full aspect-square bg-gray-100 rounded-t-lg flex items-center justify-center">
          <span className="text-gray-400 text-4xl">📷</span>
        </div>
      )
    }

    const displayType = post.display_type || 'gallery'

    switch (displayType) {
      case 'hover':
        return <HoverGallery images={post.media_urls} alt={post.title} className="rounded-t-lg aspect-square" />
      case 'horizontal':
        return <HorizontalSlider images={post.media_urls} alt={post.title} className="rounded-t-lg aspect-square" />
      case 'vertical':
        return <VerticalSlider images={post.media_urls} alt={post.title} className="rounded-t-lg aspect-square" />
      case 'video':
        return <SimpleVideoPlayer src={post.media_urls[0]} className="rounded-t-lg aspect-square" />
      case 'before_after':
      case 'before-after':
        return (
          <BeforeAfterSlider
            beforeImage={post.media_urls[0]}
            afterImage={post.media_urls[1]}
            className="rounded-t-lg aspect-square"
          />
        )
      default:
        return <PremiumGallery images={post.media_urls} descriptions={post.media_descriptions} className="rounded-t-lg aspect-square" />
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-w-7xl mx-auto p-2 items-start">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 max-w-xs"
          >
            {/* Product Image */}
            <div className="relative w-full">
              {renderMedia(post)}
              <div className="absolute top-2 left-2 bg-white/95 text-gray-800 text-xs font-semibold px-2 py-1 rounded shadow-md">
                #{index + 1}
              </div>
            </div>

            {/* Listing Header */}
            <button
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => setOpenCardId(openCardId === post.id ? '' : post.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-800 truncate">{post.title}</span>
                <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">
                  {formatPrice(post.price_cents, post.currency)}
                </span>
              </div>
            </button>

            {/* Accordion */}
            <div className="p-2">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={openCardId === post.id ? 'details' : ''}
                onValueChange={(value) => {
                  if (value === 'details') {
                    setOpenCardId(post.id)
                  } else if (openCardId === post.id) {
                    setOpenCardId('')
                  }
                }}
              >
                <AccordionItem value="details" className="border-emerald-200">
                  <AccordionTrigger className="hover:bg-emerald-50 p-0">
                    <div className="flex items-center gap-1 w-full p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleContactSeller(post)
                        }}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-2 rounded transition-colors flex items-center justify-center text-xs"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Contact
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCallSeller(post)
                        }}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Phone className="h-3 w-3 text-gray-700" />
                      </button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {/* Title, Price & Location */}
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-gray-700 text-xs flex-1 truncate">{post.title}</p>
                        <p className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                          {formatPrice(post.price_cents, post.currency)}
                        </p>
                        {post.location && (
                          <div className="flex items-center text-xs text-gray-500 whitespace-nowrap">
                            <MapPin className="h-2.5 w-2.5 mr-0.5" />
                            {post.location}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {post.description && (
                        <p className="text-gray-600 text-xs line-clamp-2">{post.description}</p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-1 pt-1 border-t">
                        {onShare && (
                          <button
                            onClick={() => onShare(post)}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-2 rounded transition-colors text-xs"
                          >
                            Share
                          </button>
                        )}
                        {onPreview && (
                          <button
                            onClick={() => onPreview(post)}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-2 rounded transition-colors text-xs"
                          >
                            Preview
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(post.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded transition-colors text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Post View */}
      {expandedPost && (
        <div className="fixed inset-0 bg-black/50 z-[100] overflow-y-auto flex items-start justify-center p-4 pt-20">
          <div className="relative max-w-3xl w-full">
            <button
              onClick={closeGallery}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="animate-fade-in">
              <PostCard post={expandedPost} showStats={true} trackViews={false} />
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 justify-center">
                {onEdit && (
                  <button
                    onClick={() => {
                      closeGallery()
                      onEdit(expandedPost.id)
                    }}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={() => {
                      closeGallery()
                      onShare(expandedPost)
                    }}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    Share
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      closeGallery()
                      onDelete(expandedPost.id)
                    }}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
