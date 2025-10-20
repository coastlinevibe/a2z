'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to prevent hydration mismatches by detecting when the component
 * has hydrated on the client side.
 * 
 * @returns true if the component has hydrated, false otherwise
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    setHydrated(true)
  }, [])
  
  return hydrated
}
