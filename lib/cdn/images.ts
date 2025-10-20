/**
 * CDN Image Transformation Utilities
 */

import { CDN_CONFIG, IMAGE_PRESETS, ImagePreset, ImageFormat, QualityPreset, QUALITY_PRESETS } from './config'

export interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number | QualityPreset
  format?: ImageFormat | 'auto'
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  blur?: number
  sharpen?: number
  gravity?: 'auto' | 'center' | 'north' | 'south' | 'east' | 'west'
  preset?: ImagePreset
}

/**
 * Get CDN URL for an image with transformations
 */
export function getCDNUrl(
  imageUrl: string,
  options: ImageTransformOptions = {}
): string {
  if (!imageUrl) return ''
  
  // If already a full URL, extract path
  let imagePath = imageUrl
  if (imageUrl.startsWith('http')) {
    try {
      const url = new URL(imageUrl)
      imagePath = url.pathname
    } catch {
      return imageUrl
    }
  }
  
  // Apply preset if specified
  if (options.preset && IMAGE_PRESETS[options.preset]) {
    options = { ...IMAGE_PRESETS[options.preset], ...options }
  }
  
  // Resolve quality preset
  if (typeof options.quality === 'string') {
    options.quality = QUALITY_PRESETS[options.quality]
  }
  
  const provider = CDN_CONFIG.provider
  
  switch (provider) {
    case 'cloudflare':
      return getCloudflareUrl(imagePath, options)
    case 'supabase':
      return getSupabaseUrl(imagePath, options)
    case 'custom':
      return getCustomCDNUrl(imagePath, options)
    default:
      return imageUrl
  }
}

/**
 * Cloudflare Images URL
 */
function getCloudflareUrl(
  imagePath: string,
  options: ImageTransformOptions
): string {
  const { cloudflare } = CDN_CONFIG
  if (!cloudflare.deliveryUrl) return imagePath
  
  const params: string[] = []
  
  if (options.width) params.push(`width=${options.width}`)
  if (options.height) params.push(`height=${options.height}`)
  if (options.quality) params.push(`quality=${options.quality}`)
  if (options.format && options.format !== 'auto') params.push(`format=${options.format}`)
  if (options.fit) params.push(`fit=${options.fit}`)
  if (options.blur) params.push(`blur=${options.blur}`)
  if (options.sharpen) params.push(`sharpen=${options.sharpen}`)
  if (options.gravity) params.push(`gravity=${options.gravity}`)
  
  const transformString = params.join(',')
  const imageId = imagePath.split('/').pop()
  
  return `${cloudflare.deliveryUrl}/${imageId}/${transformString}`
}

/**
 * Supabase Storage URL with transformations
 */
function getSupabaseUrl(
  imagePath: string,
  options: ImageTransformOptions
): string {
  const { supabase } = CDN_CONFIG
  const baseUrl = supabase.cdnUrl || `${supabase.url}/storage/v1/object/public/${supabase.bucket}`
  
  // Clean path
  const cleanPath = imagePath.replace(/^\//, '')
  
  const params = new URLSearchParams()
  
  if (options.width) params.append('width', options.width.toString())
  if (options.height) params.append('height', options.height.toString())
  if (options.quality) params.append('quality', options.quality.toString())
  if (options.format && options.format !== 'auto') params.append('format', options.format)
  
  const queryString = params.toString()
  return queryString ? `${baseUrl}/${cleanPath}?${queryString}` : `${baseUrl}/${cleanPath}`
}

/**
 * Custom CDN URL
 */
function getCustomCDNUrl(
  imagePath: string,
  options: ImageTransformOptions
): string {
  const { custom } = CDN_CONFIG
  if (!custom.baseUrl) return imagePath
  
  const params = new URLSearchParams()
  
  if (options.width) params.append('w', options.width.toString())
  if (options.height) params.append('h', options.height.toString())
  if (options.quality) params.append('q', options.quality.toString())
  if (options.format && options.format !== 'auto') params.append('f', options.format)
  if (options.fit) params.append('fit', options.fit)
  
  const queryString = params.toString()
  const cleanPath = imagePath.replace(/^\//, '')
  
  return queryString ? `${custom.baseUrl}/${cleanPath}?${queryString}` : `${custom.baseUrl}/${cleanPath}`
}

/**
 * Generate responsive srcset for an image
 */
export function generateSrcSet(
  imageUrl: string,
  options: ImageTransformOptions = {}
): string {
  const breakpoints = CDN_CONFIG.breakpoints
  const srcset: string[] = []
  
  Object.entries(breakpoints).forEach(([name, width]) => {
    const url = getCDNUrl(imageUrl, { ...options, width })
    srcset.push(`${url} ${width}w`)
  })
  
  return srcset.join(', ')
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(
  maxWidth?: number
): string {
  if (maxWidth) {
    return `(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`
  }
  
  return `
    (max-width: 640px) 100vw,
    (max-width: 768px) 100vw,
    (max-width: 1024px) 100vw,
    1024px
  `.trim().replace(/\s+/g, ' ')
}

/**
 * Get optimized image for current device
 */
export function getOptimizedImage(
  imageUrl: string,
  options: ImageTransformOptions = {}
): {
  src: string
  srcset: string
  sizes: string
} {
  const src = getCDNUrl(imageUrl, options)
  const srcset = generateSrcSet(imageUrl, options)
  const sizes = generateSizes(options.width)
  
  return { src, srcset, sizes }
}

/**
 * Preload critical images
 */
export function preloadImage(imageUrl: string, options: ImageTransformOptions = {}): void {
  if (typeof document === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = getCDNUrl(imageUrl, options)
  
  if (options.format === 'webp') {
    link.type = 'image/webp'
  }
  
  document.head.appendChild(link)
}

/**
 * Get blur placeholder (low quality image placeholder)
 */
export function getBlurPlaceholder(imageUrl: string): string {
  return getCDNUrl(imageUrl, {
    width: 40,
    quality: 10,
    blur: 10,
  })
}

/**
 * Get thumbnail URL
 */
export function getThumbnail(imageUrl: string, size: number = 150): string {
  return getCDNUrl(imageUrl, {
    width: size,
    height: size,
    fit: 'cover',
    quality: 80,
  })
}

/**
 * Get Open Graph image
 */
export function getOGImage(imageUrl: string): string {
  return getCDNUrl(imageUrl, {
    preset: 'og',
    quality: 85,
  })
}

/**
 * Check if image format is supported
 */
export function supportsWebP(): boolean {
  if (typeof document === 'undefined') return false
  
  const canvas = document.createElement('canvas')
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }
  return false
}

/**
 * Check if AVIF is supported
 */
export function supportsAVIF(): boolean {
  if (typeof document === 'undefined') return false
  
  const avif = new Image()
  avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A='
  
  return new Promise<boolean>((resolve) => {
    avif.onload = () => resolve(true)
    avif.onerror = () => resolve(false)
  }) as any
}

/**
 * Get best supported format
 */
export function getBestFormat(): ImageFormat {
  if (supportsAVIF()) return 'avif'
  if (supportsWebP()) return 'webp'
  return 'jpeg'
}
