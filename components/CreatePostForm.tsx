'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { createPostSchema, type CreatePostInput } from '@/lib/validators'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { MediaUploader } from './MediaUploader'
import { IconTagSelector } from './IconTagSelector'
import { PostCardPreview } from './PostCardPreview'
import { ShareModal } from './ShareModal'
import { PreviewModal } from './PreviewModal'

interface CreatePostFormProps {
  className?: string
}

export function CreatePostForm({ className }: CreatePostFormProps) {
  const { session } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdPost, setCreatedPost] = useState<any>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0)
  const [previewLayout, setPreviewLayout] = useState<'square' | 'portrait' | 'landscape'>('square')
  const [displayType, setDisplayType] = useState<'hover' | 'slider' | 'vertical' | 'premium'>('hover')
  const [mediaDescriptions, setMediaDescriptions] = useState<Record<string, string>>({})
  const [priceDisplay, setPriceDisplay] = useState<string>('')

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
      media_items: [],
    },
  })

  const watchedValues = watch()

  // Check if all required fields are completed
  const isFormComplete = () => {
    const hasMedia = (watchedValues.media_urls?.length || 0) > 0
    const hasTitle = !!watchedValues.title && watchedValues.title.trim().length > 0
    const hasPrice = !!watchedValues.price_cents && watchedValues.price_cents > 0
    const hasTags = (watchedValues.emoji_tags?.length || 0) > 0
    const hasContact = !!watchedValues.whatsapp_number && watchedValues.whatsapp_number.trim().length > 0
    const hasLocation = !!watchedValues.location && watchedValues.location.trim().length > 0
    
    return hasMedia && hasTitle && hasPrice && hasTags && hasContact && hasLocation
  }

  const onSubmit = async (data: CreatePostInput) => {
    if (data.media_urls.length === 0) {
      alert('Please upload at least one image or video.')
      return
    }

    setIsSubmitting(true)

    try {
      // Convert mediaDescriptions object to array matching media_urls order
      const descriptionsArray = data.media_urls.map(url => mediaDescriptions[url] || '')
      
      // Include display_type and media_descriptions in the submission
      const postData = {
        ...data,
        display_type: displayType,
        media_items: data.media_urls.map((url, index) => ({
          url,
          description: descriptionsArray[index]
        }))
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(postData),
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
    price_cents: watchedValues.price_cents || 0,
    currency: watchedValues.currency || 'ZAR',
    description: watchedValues.description || undefined,
    emoji_tags: watchedValues.emoji_tags || [],
    media_urls: watchedValues.media_urls || [],
    media_descriptions: mediaDescriptions,
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

            {/* Media first */}
            <MediaUploader
              mediaUrls={watchedValues.media_urls || []}
              onMediaChange={(urls) => setValue('media_urls', urls)}
              displayType={displayType}
              mediaDescriptions={mediaDescriptions}
              onDescriptionsChange={setMediaDescriptions}
              maxFiles={8}
            />

            {/* Image Display Options */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Display
              </label>
              <div className="grid grid-cols-4 gap-2">
                {/* Hover Gallery */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setDisplayType('hover')}
                    className={cn(
                      'p-2 border-2 rounded-lg transition-colors w-full',
                      displayType === 'hover'
                        ? 'border-emerald-600 bg-emerald-100'
                        : 'border-gray-200 hover:border-gray-300 bg-emerald-50'
                    )}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">🖼️</span>
                      </div>
                      <div className="font-medium text-gray-900 text-xs text-center">
                        Hover
                      </div>
                    </div>
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1 text-center">800×800px</p>
                </div>

                {/* Horizontal Slider */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setDisplayType('slider')}
                    className={cn(
                      'p-2 border-2 rounded-lg transition-colors w-full',
                      displayType === 'slider'
                        ? 'border-emerald-600 bg-emerald-100'
                        : 'border-gray-200 hover:border-gray-300 bg-emerald-50'
                    )}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">↔️</span>
                      </div>
                      <div className="font-medium text-gray-900 text-xs text-center">
                        Horizontal
                      </div>
                    </div>
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1 text-center">1200×900px</p>
                </div>

                {/* Vertical Slider */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setDisplayType('vertical')}
                    className={cn(
                      'p-2 border-2 rounded-lg transition-colors w-full',
                      displayType === 'vertical'
                        ? 'border-emerald-600 bg-emerald-100'
                        : 'border-gray-200 hover:border-gray-300 bg-emerald-50'
                    )}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">↕️</span>
                      </div>
                      <div className="font-medium text-gray-900 text-xs text-center">
                        Vertical
                      </div>
                    </div>
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1 text-center">900×1200px</p>
                </div>

                {/* Premium Gallery */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setDisplayType('premium')}
                    className={cn(
                      'p-2 border-2 rounded-lg transition-colors w-full',
                      displayType === 'premium'
                        ? 'border-emerald-600 bg-emerald-100'
                        : 'border-gray-200 hover:border-gray-300 bg-emerald-50'
                    )}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">✨</span>
                      </div>
                      <div className="font-medium text-gray-900 text-xs text-center">
                        Gallery
                      </div>
                    </div>
                  </button>
                  <p className="text-[10px] text-gray-500 mt-1 text-center">1080×1080px</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mt-4">
              Fill in the details below to create a shareable listing.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 3-Step Header */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between border-b border-gray-200 rounded-t-xl">
                <div className="flex overflow-x-auto overflow-y-hidden whitespace-nowrap">
                  <button type="button" onClick={() => setCurrentStep(0)}
                  className={cn(
                    'inline-flex items-center h-9 px-2 py-1 -mb-px text-center sm:px-3 whitespace-nowrap focus:outline-none',
                    currentStep === 0 ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                  )}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                  </svg>
                  <span className="mx-1 text-sm">Title</span>
                </button>
                <button type="button" onClick={() => setCurrentStep(1)}
                  className={cn(
                    'inline-flex items-center h-9 px-2 py-1 -mb-px text-center sm:px-3 whitespace-nowrap focus:outline-none',
                    currentStep === 1 ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                  )}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                  </svg>
                  <span className="mx-1 text-sm">Emoji Tags</span>
                </button>
                <button type="button" onClick={() => setCurrentStep(2)}
                  className={cn(
                    'inline-flex items-center h-9 px-2 py-1 -mb-px text-center sm:px-3 whitespace-nowrap focus:outline-none',
                    currentStep === 2 ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                  )}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11m-9 6v1a3 3 0 106 0v-1" />
                  </svg>
                  <span className="mx-1 text-sm">Contact & Location</span>
                </button>
                </div>
                
                {/* Navigation buttons inline with tabs */}
                <div className="flex gap-2 px-3">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => (prev - 1) as 0 | 1 | 2)}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg"
                    >
                      Back
                    </button>
                  )}
                  {currentStep < 2 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => (prev + 1) as 0 | 1 | 2)}
                      className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="p-3">
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Title *</label>
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
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                        <input
                          type="text"
                          placeholder="0.00"
                          value={priceDisplay}
                          onChange={(e) => {
                            const input = e.target.value
                            // Remove all non-digit and non-decimal characters
                            const cleaned = input.replace(/[^\d.]/g, '')
                            // Ensure only one decimal point
                            const parts = cleaned.split('.')
                            const formatted = parts.length > 2 
                              ? parts[0] + '.' + parts.slice(1).join('')
                              : cleaned
                            
                            // Parse the numeric value
                            const numValue = parseFloat(formatted) || 0
                            
                            // Format with commas for display
                            let displayValue = formatted
                            if (formatted && !formatted.endsWith('.')) {
                              const [whole, decimal] = formatted.split('.')
                              const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              displayValue = decimal !== undefined ? `${withCommas}.${decimal}` : withCommas
                            } else if (formatted.endsWith('.')) {
                              const whole = formatted.slice(0, -1)
                              displayValue = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.'
                            }
                            
                            setPriceDisplay(displayValue)
                            setValue('price_cents', Math.round(numValue * 100))
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                        {errors.price_cents && (
                          <p className="mt-1 text-sm text-red-600">{errors.price_cents.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        placeholder="Describe your product, condition, features, etc. (required)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    
                  </div>
                )}
                {currentStep === 1 && (
                  <div className="space-y-3">
                    <IconTagSelector
                      selectedTags={watchedValues.emoji_tags || []}
                      onChange={(tags) => setValue('emoji_tags', tags)}
                      maxTags={5}
                    />
                    {errors.emoji_tags && (
                      <p className="mt-1 text-sm text-red-600">{errors.emoji_tags.message}</p>
                    )}
                    
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('whatsapp_number')}
                        type="tel"
                        placeholder="0712345678 (required)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      {errors.whatsapp_number && (
                        <p className="mt-1 text-sm text-red-600">{errors.whatsapp_number.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('location')}
                        type="text"
                        placeholder="e.g., Cape Town, Western Cape (required)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      {errors.location && (
                        <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                      )}
                    </div>
                    
                  </div>
                )}
              </div>
            </div>

            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormComplete()}
              className={cn(
                "w-full font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center",
                isFormComplete() && !isSubmitting
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-300 cursor-not-allowed text-gray-500"
              )}
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
            {!isFormComplete() && (
              <p className="text-sm text-gray-500 text-center mt-2">
                Complete all fields to create your listing
              </p>
            )}
          </form>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Live Preview
            </h3>
            <PostCardPreview post={previewPost} layout={previewLayout} displayType={displayType} />
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Open Preview Modal
            </button>
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

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        post={previewPost as any}
      />
    </div>
  )
}
