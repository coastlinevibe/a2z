/**
 * Mobile Optimization Utilities
 */

// Detect if user is on mobile device
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Detect if user is on tablet
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent)
}

// Detect if user is on iOS
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

// Detect if user is on Android
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

// Get device type
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isTablet()) return 'tablet'
  if (isMobile()) return 'mobile'
  return 'desktop'
}

// Check if device supports touch
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Get viewport dimensions
export function getViewport() {
  if (typeof window === 'undefined') return { width: 0, height: 0 }
  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

// Check if in standalone mode (PWA)
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

// Prevent zoom on iOS
export function preventZoom() {
  if (typeof document === 'undefined') return
  
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault()
  })
  
  document.addEventListener('touchmove', (e) => {
    if ((e as any).scale !== 1) {
      e.preventDefault()
    }
  }, { passive: false })
}

// Enable smooth scrolling
export function enableSmoothScroll() {
  if (typeof document === 'undefined') return
  document.documentElement.style.scrollBehavior = 'smooth'
}

// Disable pull-to-refresh on mobile
export function disablePullToRefresh() {
  if (typeof document === 'undefined') return
  
  document.body.style.overscrollBehavior = 'none'
}

// Optimize for mobile viewport
export function optimizeViewport() {
  if (typeof document === 'undefined') return
  
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
    )
  }
}

// Add safe area insets for notched devices
export function addSafeAreaInsets() {
  if (typeof document === 'undefined') return
  
  const style = document.createElement('style')
  style.textContent = `
    :root {
      --safe-area-inset-top: env(safe-area-inset-top);
      --safe-area-inset-right: env(safe-area-inset-right);
      --safe-area-inset-bottom: env(safe-area-inset-bottom);
      --safe-area-inset-left: env(safe-area-inset-left);
    }
  `
  document.head.appendChild(style)
}

// Detect network connection type
export function getConnectionType(): string {
  if (typeof navigator === 'undefined') return 'unknown'
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
  return connection?.effectiveType || 'unknown'
}

// Check if on slow connection
export function isSlowConnection(): boolean {
  const type = getConnectionType()
  return type === 'slow-2g' || type === '2g'
}

// Optimize images for mobile
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return ''
  
  const viewport = getViewport()
  const targetWidth = width || viewport.width
  
  // If using Supabase storage, add transformation params
  if (url.includes('supabase')) {
    return `${url}?width=${targetWidth}&quality=80`
  }
  
  return url
}

// Debounce for scroll/resize events
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle for frequent events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Vibrate on mobile (for haptic feedback)
export function vibrate(pattern: number | number[] = 10) {
  if (typeof navigator === 'undefined') return
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

// Share API for mobile
export async function shareContent(data: {
  title?: string
  text?: string
  url?: string
}) {
  if (typeof navigator === 'undefined') return false
  
  if (navigator.share) {
    try {
      await navigator.share(data)
      return true
    } catch (error) {
      console.error('Share failed:', error)
      return false
    }
  }
  return false
}

// Copy to clipboard (mobile-friendly)
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined') return false
  
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

// Request fullscreen (for PWA)
export async function requestFullscreen(element?: HTMLElement) {
  if (typeof document === 'undefined') return
  
  const elem = element || document.documentElement
  
  if (elem.requestFullscreen) {
    await elem.requestFullscreen()
  } else if ((elem as any).webkitRequestFullscreen) {
    await (elem as any).webkitRequestFullscreen()
  } else if ((elem as any).mozRequestFullScreen) {
    await (elem as any).mozRequestFullScreen()
  }
}

// Exit fullscreen
export async function exitFullscreen() {
  if (typeof document === 'undefined') return
  
  if (document.exitFullscreen) {
    await document.exitFullscreen()
  } else if ((document as any).webkitExitFullscreen) {
    await (document as any).webkitExitFullscreen()
  } else if ((document as any).mozCancelFullScreen) {
    await (document as any).mozCancelFullScreen()
  }
}

// Lock screen orientation (for PWA)
export async function lockOrientation(orientation: 'portrait' | 'landscape') {
  if (typeof screen === 'undefined') return
  
  const screenOrientation = (screen as any).orientation
  if (screenOrientation && screenOrientation.lock) {
    try {
      await screenOrientation.lock(orientation)
    } catch (error) {
      console.error('Orientation lock failed:', error)
    }
  }
}
