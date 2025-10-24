'use client'

import { Phone, MapPin, Truck } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { PremiumGallery } from '@/components/PremiumGallery'
import { HorizontalSlider } from '@/components/HorizontalSlider'
import { VerticalSlider } from '@/components/VerticalSlider'
import { HoverGallery } from '@/components/HoverGallery'
import SimpleVideoPlayer from '@/components/ui/SimpleVideoPlayer'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { trackWhatsAppClick, trackPhoneClick } from '@/lib/analytics'

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
  verified_seller?: boolean
  seller_name?: string
  delivery_available?: boolean
}

interface PublicListingCardProps {
  post: Post
  className?: string
}

export function PublicListingCard({ post, className }: PublicListingCardProps) {
  const contactNumber = post.whatsapp_number || '0000000000'
  const price = formatPrice(post.price_cents, post.currency)

  const handleContactSeller = () => {
    trackWhatsAppClick(post.id)
    const message = encodeURIComponent(`Hi, I'm interested in: ${post.title}`)
    window.open(`https://wa.me/${contactNumber}?text=${message}`, '_blank')
  }

  const handleCallSeller = () => {
    trackPhoneClick(post.id)
    window.location.href = `tel:${contactNumber}`
  }

  const renderMedia = () => {
    if (!post.media_urls || post.media_urls.length === 0) {
      return (
        <div className="w-full aspect-square bg-gray-100 rounded-t-2xl flex items-center justify-center">
          <span className="text-gray-400 text-4xl">📷</span>
        </div>
      )
    }

    const displayType = post.display_type || 'gallery'

    switch (displayType) {
      case 'hover':
        return <HoverGallery images={post.media_urls} alt={post.title} className="rounded-t-2xl" />
      case 'horizontal':
        return <HorizontalSlider images={post.media_urls} alt={post.title} className="rounded-t-2xl" />
      case 'vertical':
        return <VerticalSlider images={post.media_urls} alt={post.title} className="rounded-t-2xl" />
      case 'video':
        return <SimpleVideoPlayer src={post.media_urls[0]} className="rounded-t-2xl aspect-square" />
      case 'before_after':
      case 'before-after':
        return (
          <BeforeAfterSlider
            beforeImage={post.media_urls[0]}
            afterImage={post.media_urls[1]}
            className="rounded-t-2xl"
          />
        )
      default:
        return <PremiumGallery images={post.media_urls} descriptions={post.media_descriptions} className="rounded-t-2xl" />
    }
  }

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto overflow-hidden',
        className
      )}
    >
      {/* Product Image */}
      <div className="w-full relative">
        {renderMedia()}
        {/* Delivery Badge */}
        {post.delivery_available && (
          <div className="absolute bottom-3 left-3 bg-emerald-600 text-white px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Truck className="h-4 w-4" />
            <span className="text-xs font-medium">Delivery</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Accordion for Details */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details" className="border-emerald-200">
            <AccordionTrigger className="hover:bg-emerald-50 p-0">
              <div className="flex items-center gap-2 w-full p-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleContactSeller()
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Seller
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCallSeller()
                  }}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Phone className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {/* Product Title, Price & Location - Top Line */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-gray-700 text-sm flex-1">{post.title}</p>
                  <p className="text-lg font-bold text-emerald-600 whitespace-nowrap">{price}</p>
                  {post.location && (
                    <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {post.location}
                    </div>
                  )}
                </div>

                {/* Description - Below */}
                {post.description && (
                  <div 
                    className="text-gray-600 text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.description }}
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
