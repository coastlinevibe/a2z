'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HoverGalleryProps {
  images: string[]
  alt?: string
  className?: string
  aspectRatio?: 'square' | 'portrait' | 'landscape'
}

export function HoverGallery({ 
  images, 
  alt = 'Gallery image', 
  className,
  aspectRatio = 'square'
}: HoverGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileHint, setShowMobileHint] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Hide mobile hint after first interaction
  useEffect(() => {
    if (currentIndex > 0) {
      setShowMobileHint(false)
    }
  }, [currentIndex])

  if (!images || images.length === 0) {
    return null
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    
    // Calculate which image to show based on horizontal position
    const imageIndex = Math.floor((x / width) * images.length)
    const clampedIndex = Math.max(0, Math.min(imageIndex, images.length - 1))
    
    setCurrentIndex(clampedIndex)
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setCurrentIndex(0) // Return to first image on desktop only
    }
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    setShowMobileHint(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1)
    setShowMobileHint(false)
  }

  const goToNext = () => {
    setCurrentIndex(currentIndex < images.length - 1 ? currentIndex + 1 : 0)
    setShowMobileHint(false)
  }

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'portrait':
        return 'aspect-[3/4]'
      case 'landscape':
        return 'aspect-[4/3]'
      default:
        return 'aspect-square'
    }
  }

  const isVideo = (url: string) => {
    return url.includes('.mp4') || url.includes('.webm') || url.includes('video')
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-gray-100',
        isMobile ? 'cursor-default' : 'cursor-pointer',
        getAspectClass(),
        className
      )}
      onMouseMove={!isMobile ? handleMouseMove : undefined}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Current Image/Video */}
      {isVideo(images[currentIndex]) ? (
        <video
          src={images[currentIndex]}
          className="w-full h-full object-cover transition-opacity duration-200"
          muted
          playsInline
          loop
        />
      ) : (
        <img
          src={images[currentIndex]}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-200"
        />
      )}

      {/* Mobile Navigation Buttons */}
      {isMobile && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity z-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity z-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Mobile Swipe Hint */}
      {isMobile && images.length > 1 && showMobileHint && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 pointer-events-none">
          <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg text-sm font-medium text-gray-800 flex items-center space-x-2">
            <ChevronLeft className="h-4 w-4" />
            <span>Swipe to browse</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Invisible hover zones for better UX */}
      {!isMobile && images.length > 1 && (
        <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${images.length}, 1fr)` }}>
          {Array.from({ length: images.length }, (_, i) => (
            <div key={i} className="hover:bg-white hover:bg-opacity-5" />
          ))}
        </div>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className={cn(
          "absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 transition-opacity duration-200",
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors duration-200',
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50'
              )}
            />
          ))}
        </div>
      )}

      {/* Image counter overlay */}
      {images.length > 1 && (
        <div className={cn(
          "absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full transition-opacity duration-200",
          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          {currentIndex + 1}/{images.length}
        </div>
      )}
    </div>
  )
}

// Wrapper component for card-style usage
interface HoverGalleryCardProps {
  images: string[]
  title: string
  price: string
  description?: string
  className?: string
  aspectRatio?: 'square' | 'portrait' | 'landscape'
  onImageHover?: (index: number) => void
}

export function HoverGalleryCard({
  images,
  title,
  price,
  description,
  className,
  aspectRatio = 'square',
  onImageHover
}: HoverGalleryCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl shadow-lg overflow-hidden max-w-sm',
      className
    )}>
      <div className="group">
        <HoverGallery 
          images={images} 
          alt={title}
          aspectRatio={aspectRatio}
          className="rounded-t-xl"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
            {title}
          </h3>
          <span className="font-bold text-emerald-600 text-lg ml-2">
            {price}
          </span>
        </div>
        
        {description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
