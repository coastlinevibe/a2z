/**
 * CDN Configuration for A2Z Platform
 * Supports Cloudflare, Supabase Storage, and custom CDN providers
 */

export const CDN_PROVIDERS = {
  CLOUDFLARE: 'cloudflare',
  SUPABASE: 'supabase',
  CUSTOM: 'custom',
} as const

export type CDNProvider = typeof CDN_PROVIDERS[keyof typeof CDN_PROVIDERS]

// CDN Configuration
export const CDN_CONFIG = {
  provider: (process.env.NEXT_PUBLIC_CDN_PROVIDER || 'supabase') as CDNProvider,
  
  // Cloudflare Images
  cloudflare: {
    accountHash: process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || '',
    deliveryUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_DELIVERY_URL || '',
    uploadUrl: process.env.CLOUDFLARE_IMAGES_UPLOAD_URL || '',
    apiToken: process.env.CLOUDFLARE_IMAGES_API_TOKEN || '',
  },
  
  // Supabase Storage (with CDN)
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    bucket: 'posts',
    cdnUrl: process.env.NEXT_PUBLIC_SUPABASE_CDN_URL || '',
  },
  
  // Custom CDN
  custom: {
    baseUrl: process.env.NEXT_PUBLIC_CDN_BASE_URL || '',
    apiKey: process.env.CDN_API_KEY || '',
  },
  
  // Image optimization defaults
  defaults: {
    quality: 85,
    format: 'auto' as 'auto' | 'webp' | 'avif' | 'jpeg' | 'png',
    fit: 'cover' as 'cover' | 'contain' | 'fill' | 'inside' | 'outside',
    blur: 0,
    sharpen: 0,
  },
  
  // Responsive breakpoints
  breakpoints: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  
  // Cache settings
  cache: {
    browserTTL: 31536000, // 1 year
    edgeTTL: 2592000, // 30 days
    staleWhileRevalidate: 86400, // 1 day
  },
}

// Image size presets
export const IMAGE_PRESETS = {
  thumbnail: { width: 150, height: 150, fit: 'cover' },
  small: { width: 320, height: 320, fit: 'cover' },
  medium: { width: 640, height: 640, fit: 'cover' },
  large: { width: 1024, height: 1024, fit: 'cover' },
  xlarge: { width: 1920, height: 1920, fit: 'inside' },
  hero: { width: 1920, height: 1080, fit: 'cover' },
  og: { width: 1200, height: 630, fit: 'cover' }, // Open Graph
} as const

export type ImagePreset = keyof typeof IMAGE_PRESETS

// Supported formats
export const SUPPORTED_FORMATS = ['webp', 'avif', 'jpeg', 'png', 'gif'] as const
export type ImageFormat = typeof SUPPORTED_FORMATS[number]

// Quality presets
export const QUALITY_PRESETS = {
  low: 60,
  medium: 75,
  high: 85,
  ultra: 95,
} as const

export type QualityPreset = keyof typeof QUALITY_PRESETS
