/**
 * CDN Caching Strategy
 */

import { CDN_CONFIG } from './config'

export interface CacheHeaders {
  'Cache-Control': string
  'CDN-Cache-Control'?: string
  'Cloudflare-CDN-Cache-Control'?: string
  'Surrogate-Control'?: string
  'Vary'?: string
  'ETag'?: string
}

/**
 * Get cache headers for images
 */
export function getImageCacheHeaders(
  maxAge: number = CDN_CONFIG.cache.browserTTL
): CacheHeaders {
  const edgeTTL = CDN_CONFIG.cache.edgeTTL
  const staleWhileRevalidate = CDN_CONFIG.cache.staleWhileRevalidate

  return {
    'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    'CDN-Cache-Control': `public, max-age=${edgeTTL}`,
    'Cloudflare-CDN-Cache-Control': `max-age=${edgeTTL}`,
    'Vary': 'Accept',
  }
}

/**
 * Get cache headers for static assets
 */
export function getStaticCacheHeaders(): CacheHeaders {
  return {
    'Cache-Control': 'public, max-age=31536000, immutable',
  }
}

/**
 * Get cache headers for dynamic content
 */
export function getDynamicCacheHeaders(maxAge: number = 60): CacheHeaders {
  return {
    'Cache-Control': `public, max-age=${maxAge}, must-revalidate`,
    'Vary': 'Accept-Encoding',
  }
}

/**
 * Get cache headers for no-cache content
 */
export function getNoCacheHeaders(): CacheHeaders {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  } as CacheHeaders
}

/**
 * Purge CDN cache for specific URLs
 */
export async function purgeCDNCache(urls: string[]): Promise<boolean> {
  const provider = CDN_CONFIG.provider

  try {
    switch (provider) {
      case 'cloudflare':
        return await purgeCloudflareCache(urls)
      case 'supabase':
        // Supabase doesn't have direct purge API
        return true
      case 'custom':
        return await purgeCustomCache(urls)
      default:
        return false
    }
  } catch (error) {
    console.error('CDN purge error:', error)
    return false
  }
}

/**
 * Purge Cloudflare cache
 */
async function purgeCloudflareCache(urls: string[]): Promise<boolean> {
  const { cloudflare } = CDN_CONFIG
  
  if (!cloudflare.apiToken) {
    console.warn('Cloudflare API token not configured')
    return false
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${cloudflare.accountHash}/purge_cache`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cloudflare.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: urls }),
    }
  )

  return response.ok
}

/**
 * Purge custom CDN cache
 */
async function purgeCustomCache(urls: string[]): Promise<boolean> {
  const { custom } = CDN_CONFIG
  
  if (!custom.apiKey) {
    console.warn('Custom CDN API key not configured')
    return false
  }

  // Implement custom CDN purge logic here
  return true
}

/**
 * Warm CDN cache by prefetching URLs
 */
export async function warmCDNCache(urls: string[]): Promise<void> {
  const promises = urls.map(url =>
    fetch(url, { method: 'HEAD' }).catch(() => {})
  )
  
  await Promise.all(promises)
}

/**
 * Get cache status from response headers
 */
export function getCacheStatus(headers: Headers): {
  hit: boolean
  age?: number
  ttl?: number
} {
  const cfCacheStatus = headers.get('cf-cache-status')
  const age = headers.get('age')
  const cacheControl = headers.get('cache-control')

  let ttl: number | undefined
  if (cacheControl) {
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/)
    if (maxAgeMatch) {
      ttl = parseInt(maxAgeMatch[1])
    }
  }

  return {
    hit: cfCacheStatus === 'HIT',
    age: age ? parseInt(age) : undefined,
    ttl,
  }
}

/**
 * Generate ETag for content
 */
export function generateETag(content: string | Buffer): string {
  const crypto = require('crypto')
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex')
}

/**
 * Check if content is fresh based on ETag
 */
export function isContentFresh(
  requestETag: string | null,
  currentETag: string
): boolean {
  return requestETag === currentETag
}

/**
 * Get cache key for image transformation
 */
export function getCacheKey(
  imageUrl: string,
  options: Record<string, any>
): string {
  const sortedOptions = Object.keys(options)
    .sort()
    .map(key => `${key}=${options[key]}`)
    .join('&')
  
  return `${imageUrl}?${sortedOptions}`
}

/**
 * Cache control directives
 */
export const CACHE_DIRECTIVES = {
  IMMUTABLE: 'public, max-age=31536000, immutable',
  LONG: 'public, max-age=2592000, stale-while-revalidate=86400',
  MEDIUM: 'public, max-age=3600, stale-while-revalidate=600',
  SHORT: 'public, max-age=60, must-revalidate',
  NO_CACHE: 'no-store, no-cache, must-revalidate',
} as const
