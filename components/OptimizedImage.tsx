'use client'

import { useState, useEffect, useRef } from 'react'
import { getCDNUrl, getOptimizedImage, getBlurPlaceholder, ImageTransformOptions } from '@/lib/cdn/images'

interface OptimizedImageProps extends ImageTransformOptions {
  src: string
  alt: string
  className?: string
  priority?: boolean
  lazy?: boolean
  onLoad?: () => void
  onError?: () => void
  placeholder?: 'blur' | 'empty'
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  priority = false,
  lazy = true,
  onLoad,
  onError,
  placeholder = 'blur',
  ...transformOptions
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(!lazy || priority)
  const imgRef = useRef<HTMLImageElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px',
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, priority, isInView])

  const { src: optimizedSrc, srcset, sizes } = getOptimizedImage(src, transformOptions)
  const blurSrc = placeholder === 'blur' ? getBlurPlaceholder(src) : undefined

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    onError?.()
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {!isLoaded && blurSrc && (
        <img
          src={blurSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={isInView ? optimizedSrc : undefined}
        srcSet={isInView ? srcset : undefined}
        sizes={isInView ? sizes : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      />

      {/* Loading skeleton */}
      {!isLoaded && !blurSrc && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}

interface ResponsiveImageProps {
  src: string
  alt: string
  aspectRatio?: number
  className?: string
  priority?: boolean
  sizes?: string
}

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = 16 / 9,
  className = '',
  priority = false,
  sizes,
}: ResponsiveImageProps) {
  const paddingBottom = `${(1 / aspectRatio) * 100}%`

  return (
    <div className={`relative ${className}`} style={{ paddingBottom }}>
      <OptimizedImage
        src={src}
        alt={alt}
        priority={priority}
        className="absolute inset-0"
        fit="cover"
      />
    </div>
  )
}

interface ImageGalleryProps {
  images: string[]
  alt?: string
  className?: string
}

export function ImageGallery({ images, alt = 'Gallery image', className = '' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className={`relative ${className}`}>
      <OptimizedImage
        src={images[currentIndex]}
        alt={`${alt} ${currentIndex + 1}`}
        priority={currentIndex === 0}
        preset="large"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Previous image"
          >
            ←
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Next image"
          >
            →
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface AvatarProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fallback?: string
  className?: string
}

export function Avatar({ src, alt, size = 'md', fallback, className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  const sizePixels = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  }

  if (!src) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold ${className}`}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizePixels[size]}
      height={sizePixels[size]}
      fit="cover"
      quality="high"
      className={`${sizeClasses[size]} rounded-full ${className}`}
    />
  )
}
