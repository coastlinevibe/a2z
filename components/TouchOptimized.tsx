'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { vibrate } from '@/lib/mobile/utils'

interface TouchButtonProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  haptic?: boolean
  disabled?: boolean
}

export function TouchButton({ 
  children, 
  onClick, 
  className = '', 
  haptic = true,
  disabled = false 
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = () => {
    if (disabled) return
    setIsPressed(true)
    if (haptic) vibrate(10)
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    if (!disabled && onClick) onClick()
  }

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => setIsPressed(false)}
      disabled={disabled}
      className={`
        touch-manipulation select-none
        transition-all duration-150
        ${isPressed ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        ${className}
      `}
    >
      {children}
    </button>
  )
}

interface SwipeableProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
  className?: string
}

export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = ''
}: SwipeableProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const touchEnd = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return

    const deltaX = touchStart.current.x - touchEnd.current.x
    const deltaY = touchStart.current.y - touchEnd.current.y

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Horizontal swipe
    if (absX > absY && absX > threshold) {
      if (deltaX > 0 && onSwipeLeft) {
        vibrate(10)
        onSwipeLeft()
      } else if (deltaX < 0 && onSwipeRight) {
        vibrate(10)
        onSwipeRight()
      }
    }
    // Vertical swipe
    else if (absY > absX && absY > threshold) {
      if (deltaY > 0 && onSwipeUp) {
        vibrate(10)
        onSwipeUp()
      } else if (deltaY < 0 && onSwipeDown) {
        vibrate(10)
        onSwipeDown()
      }
    }

    touchStart.current = null
    touchEnd.current = null
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={className}
    >
      {children}
    </div>
  )
}

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  threshold?: number
}

export function PullToRefresh({ 
  children, 
  onRefresh, 
  threshold = 80 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY
      const distance = currentY - startY.current
      
      if (distance > 0) {
        setPullDistance(Math.min(distance, threshold * 1.5))
      }
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      vibrate(20)
      
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  const progress = Math.min((pullDistance / threshold) * 100, 100)

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-center h-16 bg-emerald-50 z-50">
          <div className="flex items-center gap-2">
            {isRefreshing ? (
              <>
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-emerald-600 font-medium">Refreshing...</span>
              </>
            ) : (
              <>
                <div 
                  className="w-5 h-5 border-2 border-emerald-600 rounded-full"
                  style={{
                    background: `conic-gradient(#059669 ${progress}%, transparent ${progress}%)`
                  }}
                />
                <span className="text-sm text-emerald-600 font-medium">
                  {progress >= 100 ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      
      <div
        style={{
          transform: `translateY(${isRefreshing ? 64 : pullDistance * 0.5}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  )
}

interface LongPressProps {
  children: ReactNode
  onLongPress: () => void
  delay?: number
  className?: string
}

export function LongPress({ 
  children, 
  onLongPress, 
  delay = 500,
  className = '' 
}: LongPressProps) {
  const [isLongPressing, setIsLongPressing] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const start = () => {
    setIsLongPressing(true)
    timerRef.current = setTimeout(() => {
      vibrate([10, 50, 10])
      onLongPress()
      setIsLongPressing(false)
    }, delay)
  }

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsLongPressing(false)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <div
      onTouchStart={start}
      onTouchEnd={cancel}
      onTouchMove={cancel}
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      className={`
        touch-manipulation select-none
        ${isLongPressing ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}
        transition-all duration-150
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function TouchFeedback({ children }: { children: ReactNode }) {
  return (
    <div className="touch-manipulation active:opacity-70 active:scale-95 transition-all duration-150">
      {children}
    </div>
  )
}
