'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerticalSliderProps {
  images: string[]
  alt: string
  className?: string
}

export function VerticalSlider({ images, alt, className }: VerticalSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setCurrentIndex(0)
  }, [images])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('video')
  }

  if (images.length === 0) {
    return (
      <div className={cn('relative w-full bg-gray-100 rounded-lg overflow-hidden', className)}>
        <div className="aspect-square flex items-center justify-center">
          <span className="text-gray-400 text-4xl">📷</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative w-full bg-white rounded-lg overflow-hidden', className)}>
      <div className="flex w-full aspect-[16/9]">
        {/* Vertical Thumbnail Navigation - Left Side */}
        {images.length > 1 && (
          <div className="relative w-20 bg-gray-50 flex flex-col shrink-0">
            {/* Up Arrow */}
            <button
              type="button"
              onClick={goToPrevious}
              className="flex items-center justify-center h-10 text-gray-600 hover:bg-gray-200 focus:outline-none transition-colors"
              aria-label="Previous slide"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            {/* Thumbnails */}
            <div className="flex-1 overflow-y-auto py-2">
              <div className="flex flex-col items-center gap-2 px-2">
                {images.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToSlide(index)}
                    className={cn(
                      'shrink-0 border-2 rounded-md overflow-hidden cursor-pointer w-14 h-14 transition-all',
                      currentIndex === index
                        ? 'border-blue-400 ring-2 ring-blue-400/50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {isVideo(url) ? (
                      <video
                        src={url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Down Arrow */}
            <button
              type="button"
              onClick={goToNext}
              className="flex items-center justify-center h-10 text-gray-600 hover:bg-gray-200 focus:outline-none transition-colors"
              aria-label="Next slide"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Slider - Right Side */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="flex transition-transform duration-700 ease-in-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((url, index) => (
              <div key={index} className="min-w-full h-full flex-shrink-0">
                {isVideo(url) ? (
                  <video
                    src={url}
                    className="w-full h-full object-contain bg-gray-100"
                    controls
                    playsInline
                  />
                ) : (
                  <img
                    src={url}
                    alt={`${alt} - ${index + 1}`}
                    className="w-full h-full object-contain bg-gray-100"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons on Main Image */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                className="absolute inset-y-0 left-0 flex items-center justify-center w-12 text-white hover:bg-gray-800/10 focus:outline-none transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6 drop-shadow-lg" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-white hover:bg-gray-800/10 focus:outline-none transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6 drop-shadow-lg" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
