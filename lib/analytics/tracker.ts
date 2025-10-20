import { v4 as uuidv4 } from 'uuid'

// Get or create visitor ID (stored in localStorage)
export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  
  let visitorId = localStorage.getItem('a2z_visitor_id')
  if (!visitorId) {
    visitorId = uuidv4()
    localStorage.setItem('a2z_visitor_id', visitorId)
  }
  return visitorId
}

// Get or create session ID (stored in sessionStorage)
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem('a2z_session_id')
  if (!sessionId) {
    sessionId = uuidv4()
    sessionStorage.setItem('a2z_session_id', sessionId)
  }
  return sessionId
}

// Parse UTM parameters from URL
export function getUTMParams(): {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
} {
  if (typeof window === 'undefined') return {}
  
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  }
}

// Get device info
export function getDeviceInfo(): {
  device_type: string
  browser: string
  os: string
  user_agent: string
} {
  if (typeof window === 'undefined') {
    return {
      device_type: 'unknown',
      browser: 'unknown',
      os: 'unknown',
      user_agent: ''
    }
  }

  const ua = navigator.userAgent

  // Device type
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua)
  const device_type = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

  // Browser
  let browser = 'unknown'
  if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edge')) browser = 'Edge'
  else if (ua.includes('Opera')) browser = 'Opera'

  // OS
  let os = 'unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

  return {
    device_type,
    browser,
    os,
    user_agent: ua
  }
}

// Track event
export async function trackEvent(params: {
  event_type: 'view' | 'click' | 'whatsapp_click' | 'phone_click' | 'share'
  post_id: string
  user_id?: string
  metadata?: Record<string, any>
}): Promise<void> {
  try {
    const { event_type, post_id, user_id, metadata = {} } = params

    const data = {
      event_type,
      post_id,
      user_id,
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      referrer: document.referrer || null,
      ...getUTMParams(),
      ...getDeviceInfo(),
      metadata
    }

    // Send to analytics API
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      // Don't wait for response
      keepalive: true
    })
  } catch (error) {
    // Silently fail - don't break user experience
    console.error('Analytics tracking error:', error)
  }
}

// Track page view
export function trackPageView(postId: string, userId?: string): void {
  trackEvent({
    event_type: 'view',
    post_id: postId,
    user_id: userId
  })
}

// Track WhatsApp click
export function trackWhatsAppClick(postId: string, userId?: string): void {
  trackEvent({
    event_type: 'whatsapp_click',
    post_id: postId,
    user_id: userId
  })
}

// Track phone click
export function trackPhoneClick(postId: string, userId?: string): void {
  trackEvent({
    event_type: 'phone_click',
    post_id: postId,
    user_id: userId
  })
}

// Track share
export function trackShare(postId: string, platform: string, userId?: string): void {
  trackEvent({
    event_type: 'share',
    post_id: postId,
    user_id: userId,
    metadata: { platform }
  })
}
