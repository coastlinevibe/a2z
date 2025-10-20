'use client'

import { useHydrated } from '@/hooks/useHydrated'

interface HydrationSafeProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Wrapper component that prevents hydration mismatches by only rendering
 * children after hydration is complete on the client side.
 */
export function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
  const hydrated = useHydrated()
  
  if (!hydrated) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

/**
 * Higher-order component version for wrapping entire components
 */
export function withHydrationSafe<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function HydrationSafeComponent(props: P) {
    return (
      <HydrationSafe fallback={fallback}>
        <Component {...props} />
      </HydrationSafe>
    )
  }
}
