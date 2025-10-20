'use client'

import { useEffect, useRef } from 'react'
import { trackPageView as trackPageViewNew, trackWhatsAppClick as trackWhatsAppNew, trackPhoneClick as trackPhoneNew } from './analytics/tracker'

// Track page views with deduplication
export function usePageView(postId: string | null) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current || !postId) return

    // Check if we've already tracked this view in the last 30 minutes
    const viewKey = `a2z_view_${postId}`
    const lastView = localStorage.getItem(viewKey)
    const now = Date.now()
    const thirtyMinutes = 30 * 60 * 1000

    if (lastView && (now - parseInt(lastView)) < thirtyMinutes) {
      return
    }

    // Track the view using new analytics system
    trackPageViewNew(postId)

    // Store the timestamp
    localStorage.setItem(viewKey, now.toString())
    hasTracked.current = true
  }, [postId])
}

// Track clicks
export function trackClick(postId: string, action: string = 'click') {
  // Legacy support - map to new system
  if (action === 'click') {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        event_type: 'click',
        post_id: postId 
      }),
    }).catch(console.error)
  }
}

// Track WhatsApp clicks specifically
export function trackWhatsAppClick(postId: string) {
  trackWhatsAppNew(postId)
}

// Track phone clicks specifically  
export function trackPhoneClick(postId: string) {
  trackPhoneNew(postId)
}
