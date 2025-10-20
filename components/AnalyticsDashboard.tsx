'use client'

import { useState, useEffect } from 'react'
import { Eye, MousePointer, MessageCircle, Phone, Share2, TrendingUp, Smartphone, Monitor, Tablet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AnalyticsData {
  totals: {
    views: number
    unique_views: number
    clicks: number
    whatsapp_clicks: number
    phone_clicks: number
    shares: number
  }
  daily: Array<{
    date: string
    views: number
    clicks: number
  }>
  sources: Record<string, number>
  devices: Record<string, number>
}

interface AnalyticsDashboardProps {
  postId: string
  days?: number
}

export function AnalyticsDashboard({ postId, days = 30 }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [postId, days])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/stats?post_id=${postId}&days=${days}`)
      const result = await response.json()
      
      if (result.success) {
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-gray-200 rounded-lg"></div>
        <div className="h-24 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (!data) {
    return <div className="text-gray-500">No analytics data available</div>
  }

  const stats = [
    {
      label: 'Total Views',
      value: data.totals.views,
      icon: Eye,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Unique Views',
      value: data.totals.unique_views,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      label: 'Total Clicks',
      value: data.totals.clicks,
      icon: MousePointer,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      label: 'WhatsApp',
      value: data.totals.whatsapp_clicks,
      icon: MessageCircle,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'Phone Calls',
      value: data.totals.phone_clicks,
      icon: Phone,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      label: 'Shares',
      value: data.totals.shares,
      icon: Share2,
      color: 'text-pink-600 bg-pink-100'
    }
  ]

  const deviceIcons = {
    mobile: Smartphone,
    desktop: Monitor,
    tablet: Tablet
  }

  const topSources = Object.entries(data.sources)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Engagement Rate */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Engagement Rate</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Click-through Rate</span>
              <span className="text-sm font-semibold text-gray-900">
                {data.totals.views > 0 
                  ? ((data.totals.clicks / data.totals.views) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${data.totals.views > 0 ? (data.totals.clicks / data.totals.views) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Traffic Sources & Devices */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Traffic Sources</h3>
          <div className="space-y-3">
            {topSources.length > 0 ? (
              topSources.map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate flex-1">{source}</span>
                  <Badge variant="outline" className="ml-2">
                    {count}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No traffic data yet</p>
            )}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Device Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(data.devices).map(([device, count]) => {
              const Icon = deviceIcons[device as keyof typeof deviceIcons] || Monitor
              const total = Object.values(data.devices).reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0
              
              return (
                <div key={device} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 capitalize">{device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{percentage}%</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Period Info */}
      <div className="text-center text-sm text-gray-500">
        Showing data for the last {days} days
      </div>
    </div>
  )
}
