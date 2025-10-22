'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Clock, RefreshCw, Zap } from 'lucide-react'
import { getFreeAccountResetInfo, type FreeAccountResetInfo } from '@/lib/freeAccountReset'
import { useAuth } from '@/lib/auth'
import Link from 'next/link'

interface NotificationBannerProps {
  resetInfo: FreeAccountResetInfo
  onUpgradeClick?: () => void
  onDismiss?: () => void
}

function NotificationBanner({ resetInfo, onUpgradeClick, onDismiss }: NotificationBannerProps) {
  const { isWarningDay, isResetDay, daysUntilReset } = resetInfo

  if (isResetDay) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 text-blue-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Your 7-day cycle has reset
              </p>
              <p className="text-sm text-blue-700">
                Listings and images cleared — start fresh or upgrade to keep them longer.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              onClick={onUpgradeClick}
            >
              <Zap className="w-4 h-4 inline mr-1" />
              Go Premium
            </Link>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-blue-400 hover:text-blue-600 p-1"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isWarningDay) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Your 7-day cycle ends in 24 hours
              </p>
              <p className="text-sm text-yellow-700">
                Profile details stay — listings and images will be cleared automatically.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/pricing"
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              onClick={onUpgradeClick}
            >
              <Zap className="w-4 h-4 inline mr-1" />
              Upgrade Now
            </Link>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-yellow-400 hover:text-yellow-600 p-1"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return null
}

interface ResetCounterProps {
  resetInfo: FreeAccountResetInfo
}

function ResetCounter({ resetInfo }: ResetCounterProps) {
  const { daysUntilReset, nextResetDate } = resetInfo
  const progressPercentage = ((7 - daysUntilReset) / 7) * 100

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            Free Account Cycle
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {daysUntilReset} day{daysUntilReset !== 1 ? 's' : ''} left
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <p className="text-xs text-gray-600">
        Resets {nextResetDate.toLocaleDateString()} — profile stays, listings refresh weekly
      </p>
    </div>
  )
}

export default function FreeAccountNotifications() {
  const { user } = useAuth()
  const [resetInfo, setResetInfo] = useState<FreeAccountResetInfo | null>(null)
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) return

    const fetchResetInfo = async () => {
      const info = await getFreeAccountResetInfo(user.id)
      setResetInfo(info)
    }

    fetchResetInfo()
    
    // Refresh every hour to keep info current
    const interval = setInterval(fetchResetInfo, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  if (!resetInfo) return null

  const notificationKey = `${resetInfo.isResetDay ? 'reset' : 'warning'}-${resetInfo.nextResetDate.toDateString()}`
  const shouldShowNotification = (resetInfo.isWarningDay || resetInfo.isResetDay) && 
                                !dismissedNotifications.has(notificationKey)

  const handleDismiss = () => {
    setDismissedNotifications(prev => new Set(Array.from(prev).concat([notificationKey])))
  }

  const handleUpgradeClick = () => {
    // Track upgrade click for analytics if needed
    console.log('Free user clicked upgrade from notification')
  }

  return (
    <div>
      {shouldShowNotification && (
        <NotificationBanner 
          resetInfo={resetInfo}
          onUpgradeClick={handleUpgradeClick}
          onDismiss={handleDismiss}
        />
      )}
      
      <ResetCounter resetInfo={resetInfo} />
    </div>
  )
}
