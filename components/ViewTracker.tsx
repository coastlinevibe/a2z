'use client'

import { useEffect } from 'react'
import { trackPageView } from '@/lib/analytics/tracker'

interface ViewTrackerProps {
  postId: string
  userId?: string
}

export function ViewTracker({ postId, userId }: ViewTrackerProps) {
  useEffect(() => {
    // Track the page view when component mounts
    trackPageView(postId, userId)
  }, [postId, userId])

  // This component doesn't render anything
  return null
}
