'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface MasonryGalleryProps {
  images: string[]
  alt: string
  className?: string
  descriptions?: Record<string, string>
}

export function MasonryGallery({ images, alt, className, descriptions = {} }: MasonryGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

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

  // Define grid item sizes based on index for variety
  const getItemSize = (index: number) => {
    const pattern = index % 6
    if (pattern === 1 || pattern === 3) return 'row-span-2' // medium
    if (pattern === 4) return 'row-span-3' // large
    return 'row-span-1' // default
  }

  return (
    <>
      <div className={cn('relative w-full bg-white rounded-lg overflow-hidden', className)}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 auto-rows-[100px]">
          {images.map((url, index) => (
            <div
              key={index}
              className={cn(
                'relative overflow-hidden rounded-lg cursor-pointer group',
                'transition-transform duration-300 hover:scale-105 hover:z-10',
                getItemSize(index)
              )}
              onClick={() => setSelectedImage(index)}
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
                  alt={`${alt} - ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-0 transition-opacity duration-300" />
              {/* Description */}
              {descriptions[url] && (
                <div className="absolute bottom-0 left-0 right-0 bg-white p-2 z-10">
                  <p className="text-xs text-gray-700 line-clamp-2">
                    {descriptions[url]}
                  </p>
                </div>
              )}
              {/* Number badge */}
              <div className={cn(
                "absolute left-2 bg-white px-2 py-1 rounded text-xs font-bold text-gray-700 z-10",
                descriptions[url] ? "top-2" : "bottom-2"
              )}>
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <div className="max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {isVideo(images[selectedImage]) ? (
              <video
                src={images[selectedImage]}
                className="max-w-full max-h-[90vh] object-contain"
                controls
                autoPlay
              />
            ) : (
              <img
                src={images[selectedImage]}
                alt={`${alt} - ${selectedImage + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
          </div>
          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white text-4xl font-bold hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => (prev! === 0 ? images.length - 1 : prev! - 1))
                }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 text-white text-4xl font-bold hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedImage((prev) => (prev! === images.length - 1 ? 0 : prev! + 1))
                }}
              >
                ›
              </button>
            </>
          )}
          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
