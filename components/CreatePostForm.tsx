'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { createPostSchema, type CreatePostInput } from '@/lib/validators'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { MediaUploader } from './MediaUploader'
import { EmojiTags } from './EmojiTags'
import { PostCardPreview } from './PostCardPreview'
import { ShareModal } from './ShareModal'

interface CreatePostFormProps {
  className?: string
}

export function CreatePostForm({ className }: CreatePostFormProps) {
  const { session } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdPost, setCreatedPost] = useState<any>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [previewLayout, setPreviewLayout] = useState<'square' | 'portrait' | 'landscape'>('square')
  const [displayType, setDisplayType] = useState<'hover' | 'slider'>('hover')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      currency: 'ZAR',
      emoji_tags: [],
      media_urls: [],
    },
  })

  const watchedValues = watch()

  const onSubmit = async (data: CreatePostInput) => {
    if (data.media_urls.length === 0) {
      alert('Please upload at least one image or video.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create post')
      }

      const result = await response.json()
      setCreatedPost(result.data)
      setShowShareModal(true)
      reset()
    } catch (error) {
      console.error('Error creating post:', error)
      alert(error instanceof Error ? error.message : 'Failed to create post')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Create preview post object
  const previewPost = {
    id: 'preview',
    title: watchedValues.title || 'Your Product Title',
    price_cents: (watchedValues.price_cents || 0) * 100,
    currency: watchedValues.currency || 'ZAR',
    description: watchedValues.description || undefined,
    emoji_tags: watchedValues.emoji_tags || [],
    media_urls: watchedValues.media_urls || [],
    whatsapp_number: watchedValues.whatsapp_number || undefined,
    location: watchedValues.location || undefined,
    views: 0,
    clicks: 0,
    created_at: new Date().toISOString(),
  }

  return (
    <div className={cn('max-w-6xl mx-auto', className)}>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Listing
            </h2>
            <p className="text-gray-600">
              Fill in the details below to create a shareable listing for WhatsApp.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Media Upload */}
            <MediaUploader
              mediaUrls={watchedValues.media_urls || []}
              onMediaChange={(urls) => setValue('media_urls', urls)}
            />

            {/* Image Display Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Image Display
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Hover Gallery */}
                <button
                  type="button"
                  onClick={() => setDisplayType('hover')}
                  className={cn(
                    'p-3 border-2 rounded-lg transition-colors',
                    displayType === 'hover'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🖼️</span>
                    </div>
                    <div className="font-medium text-gray-900 text-sm text-center">
                      Hover Gallery
                    </div>
                  </div>
                </button>

                {/* Horizontal Slider */}
                <button
                  type="button"
                  onClick={() => setDisplayType('slider')}
                  className={cn(
                    'p-3 border-2 rounded-lg transition-colors',
                    displayType === 'slider'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-xl">↔️</span>
                    </div>
                    <div className="font-medium text-gray-900 text-sm text-center">
                      Horizontal Slider
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="e.g., Handmade Wooden Table"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  {...register('price_cents', { 
                    valueAsNumber: true,
                    setValueAs: (value) => Math.round(parseFloat(value) * 100) || 0
                  })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                {errors.price_cents && (
                  <p className="mt-1 text-sm text-red-600">{errors.price_cents.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  {...register('currency')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="ZAR">ZAR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe your product, condition, features, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Emoji Tags */}
            <EmojiTags
              selectedTags={watchedValues.emoji_tags || []}
              onTagsChange={(tags) => setValue('emoji_tags', tags)}
            />

            {/* WhatsApp Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                {...register('whatsapp_number')}
                type="tel"
                placeholder="0712345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter SA number (e.g., 0712345678) - will be auto-formatted to +27712345678
              </p>
              {errors.whatsapp_number && (
                <p className="mt-1 text-sm text-red-600">{errors.whatsapp_number.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                {...register('location')}
                type="text"
                placeholder="e.g., Cape Town, Western Cape"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || (watchedValues.media_urls?.length || 0) === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Listing...
                </>
              ) : (
                'Create Listing'
              )}
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Live Preview
            </h3>
            <PostCardPreview post={previewPost} layout={previewLayout} displayType={displayType} />
            <p className="text-sm text-gray-500 text-center">
              This is how your listing will appear when shared
            </p>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {createdPost && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          post={createdPost}
        />
      )}
    </div>
  )
}
