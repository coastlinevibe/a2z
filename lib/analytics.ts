'use client'

import { useEffect, useRef } from 'react'

// Track page views with cookie-based deduplication
export function usePageView(postId: string | null) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current || !postId) return

    // Check if we've already tracked this view in the last 30 minutes
    const viewKey = `sellr_view_${postId}`
    const lastView = localStorage.getItem(viewKey)
    const now = Date.now()
    const thirtyMinutes = 30 * 60 * 1000

    if (lastView && (now - parseInt(lastView)) < thirtyMinutes) {
      return
    }

    // Track the view
    fetch(`/api/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view' }),
    }).catch(console.error)

    // Store the timestamp
    localStorage.setItem(viewKey, now.toString())
    hasTracked.current = true
  }, [postId])
}

// Track clicks
export function trackClick(postId: string, action: string = 'click') {
  fetch(`/api/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  }).catch(console.error)
}

// Track WhatsApp clicks specifically
export function trackWhatsAppClick(postId: string) {
  trackClick(postId, 'click')
}

// Track phone clicks specifically  
export function trackPhoneClick(postId: string) {
  trackClick(postId, 'click')
}
