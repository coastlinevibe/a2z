'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PremiumGalleryProps {
  images: string[]
  descriptions?: string[]
  className?: string
}

export function PremiumGallery({ images, descriptions = [], className }: PremiumGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)

  const imageCount = images.length
  const baseTileClass = 'relative overflow-hidden bg-white group cursor-pointer transition-shadow duration-300'
  const defaultTileShadow = 'shadow-md hover:shadow-xl'
  const baseImageClass = 'w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-500'

  if (imageCount === 0) {
    return (
      <div className={cn('w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center', className)}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-sm">No images</p>
        </div>
      </div>
    )
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index)
    setIsZoomed(false)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
    setIsZoomed(false)
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % imageCount)
      setIsZoomed(false)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + imageCount) % imageCount)
      setIsZoomed(false)
    }
  }

  // Layout configurations based on image count
  const getLayout = () => {
    switch (imageCount) {
      case 1:
        return (
          <div className={cn(baseTileClass, 'w-full aspect-square rounded-2xl shadow-lg hover:shadow-2xl')} onClick={() => openLightbox(0)}>
            <img src={images[0]} alt="Image 1" className={baseImageClass} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="grid grid-cols-2 gap-2 w-full">
            {images.map((img, idx) => (
              <div key={idx} className={cn(baseTileClass, defaultTileShadow, 'aspect-square rounded-xl')} onClick={() => openLightbox(idx)}>
                <img src={img} alt={`Image ${idx + 1}`} className={baseImageClass} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        )

      case 3:
        return (
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className={cn(baseTileClass, defaultTileShadow, 'row-span-2 aspect-square rounded-xl')} onClick={() => openLightbox(0)}>
              <img src={images[0]} alt="Image 1" className={baseImageClass} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            {images.slice(1).map((img, idx) => (
              <div key={idx + 1} className={cn(baseTileClass, defaultTileShadow, 'aspect-square rounded-xl')} onClick={() => openLightbox(idx + 1)}>
                <img src={img} alt={`Image ${idx + 2}`} className={baseImageClass} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        )

      case 4:
        return (
          <div className="grid grid-cols-2 gap-2 w-full">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-white group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300" onClick={() => openLightbox(idx)}>
                <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        )

      case 5:
        return (
          <div className="grid grid-cols-4 gap-2 w-full">
            <div className={cn(baseTileClass, defaultTileShadow, 'col-span-2 row-span-2 aspect-square rounded-xl')} onClick={() => openLightbox(0)}>
              <img src={images[0]} alt="Image 1" className={baseImageClass} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            {images.slice(1).map((img, idx) => (
              <div key={idx + 1} className={cn(baseTileClass, defaultTileShadow, 'col-span-2 aspect-[2/1] rounded-xl')} onClick={() => openLightbox(idx + 1)}>
                <img src={img} alt={`Image ${idx + 2}`} className={baseImageClass} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        )

      case 6:
        return (
          <div className="grid grid-cols-3 gap-2 w-full">
            {images.map((img, idx) => (
              <div key={idx} className={cn(baseTileClass, defaultTileShadow, 'aspect-square rounded-xl')} onClick={() => openLightbox(idx)}>
                <img src={img} alt={`Image ${idx + 1}`} className={baseImageClass} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        )

      case 7:
        return (
          <div className="grid grid-cols-4 gap-2 w-full">
            <div className="relative col-span-2 row-span-2 aspect-square rounded-xl overflow-hidden bg-white group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300" onClick={() => openLightbox(0)}>
              <img src={images[0]} alt="Image 1" className="w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            {images.slice(1).map((img, idx) => (
              <div key={idx + 1} className="relative col-span-1 aspect-square rounded-xl overflow-hidden bg-white group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300" onClick={() => openLightbox(idx + 1)}>
                <img src={img} alt={`Image ${idx + 2}`} className="w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        )

      case 8:
        return (
          <div className="grid grid-cols-4 gap-2 w-full">
            <div className="relative col-span-2 row-span-2 aspect-square rounded-xl overflow-hidden bg-white group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300" onClick={() => openLightbox(0)}>
              <img src={images[0]} alt="Image 1" className="w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            {images.slice(1, 5).map((img, idx) => (
              <div key={idx + 1} className="relative col-span-1 aspect-square rounded-xl overflow-hidden bg-white group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300" onClick={() => openLightbox(idx + 1)}>
                <img src={img} alt={`Image ${idx + 2}`} className="w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
            {images.slice(5).map((img, idx) => (
              <div key={idx + 5} className="relative col-span-1 aspect-square rounded-xl overflow-hidden bg-white group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300" onClick={() => openLightbox(idx + 5)}>
                <img src={img} alt={`Image ${idx + 6}`} className="w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        )

      case 9:
        return (
          <div className="grid grid-cols-3 gap-2 w-full">
            {images.map((img, idx) => (
              <div key={idx} className={cn(baseTileClass, defaultTileShadow, 'aspect-square rounded-xl')} onClick={() => openLightbox(idx)}>
                <img src={img} alt={`Image ${idx + 1}`} className={baseImageClass} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
        )

      default:
        // For more than 9 images, show first 8 with a "+N more" overlay on the last one
        return (
          <div className="grid grid-cols-4 gap-2 w-full">
            <div className="relative col-span-2 row-span-2 aspect-square rounded-xl overflow-hidden bg-white group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300" onClick={() => openLightbox(0)}>
              <img src={images[0]} alt="Image 1" className="w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            {images.slice(1, 7).map((img, idx) => (
              <div key={idx + 1} className="relative col-span-1 aspect-square rounded-xl overflow-hidden bg-white group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300" onClick={() => openLightbox(idx + 1)}>
                <img src={img} alt={`Image ${idx + 2}`} className="w-full h-full object-cover bg-white group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
            <div className="relative col-span-1 aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300" onClick={() => openLightbox(7)}>
              <img src={images[7]} alt="Image 8" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{imageCount - 8}</span>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <>
      <div className={className}>
        {getLayout()}
      </div>

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeLightbox()
            }}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {imageCount > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 z-50 p-3 rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 z-50 p-3 rounded-full bg-white text-gray-700 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Description - Top Left */}
          {descriptions[selectedImage] && (
            <div className="absolute top-20 left-4 px-4 py-2 rounded-lg bg-white/90 text-gray-800 shadow-lg max-w-md z-50">
              <p className="text-sm leading-relaxed">{descriptions[selectedImage]}</p>
            </div>
          )}

          <div
            className={cn(
              'relative transition-transform duration-300 cursor-zoom-in flex items-center justify-center',
              isZoomed && 'scale-150 cursor-zoom-out'
            )}
            onClick={(e) => {
              e.stopPropagation()
              setIsZoomed(!isZoomed)
            }}
          >
            <img
              src={images[selectedImage]}
              alt={descriptions[selectedImage] || `Image ${selectedImage + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl bg-white"
            />
          </div>

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
            {selectedImage + 1} / {imageCount}
          </div>
        </div>
      )}
    </>
  )
}
