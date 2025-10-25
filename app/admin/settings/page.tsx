'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Settings, 
  Save,
  Shield,
  Globe,
  Mail,
  DollarSign,
  Image,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SystemSettings {
  // Platform settings
  platform_name: string
  platform_description: string
  support_email: string
  maintenance_mode: boolean
  
  // File upload settings
  max_file_size_mb: number
  allowed_file_types: string[]
  max_files_per_post: number
  
  // Subscription settings
  free_tier_post_limit: number
  free_tier_image_limit: number
  free_tier_duration_days: number
  premium_price_monthly: number
  business_price_monthly: number
  
  // Content moderation
  auto_moderation_enabled: boolean
  require_approval_new_users: boolean
  flagged_content_threshold: number
}

export default function SystemSettings() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SystemSettings>({
    platform_name: 'A2Z Marketplace',
    platform_description: 'Everything from A to Z',
    support_email: 'support@a2z.co.za',
    maintenance_mode: false,
    max_file_size_mb: 10,
    allowed_file_types: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
    max_files_per_post: 8,
    free_tier_post_limit: 3,
    free_tier_image_limit: 5,
    free_tier_duration_days: 7,
    premium_price_monthly: 49,
    business_price_monthly: 179,
    auto_moderation_enabled: false,
    require_approval_new_users: false,
    flagged_content_threshold: 5
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'platform' | 'uploads' | 'pricing' | 'moderation'>('platform')

  useEffect(() => {
    if (!user) {
      router.push('/admin/login')
      return
    }
    checkAdminAccess()
  }, [user, router])

  const checkAdminAccess = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single()

      if (error || !profile?.is_admin) {
        router.push('/admin/login')
        return
      }

      setIsAdmin(true)
      await loadSettings()
    } catch (error) {
      console.error('Admin access check failed:', error)
      router.push('/admin/login')
    }
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      // In a real implementation, you'd load these from a settings table
      // For now, we'll use the default values
      setLoading(false)
    } catch (error) {
      console.error('Failed to load settings:', error)
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      
      // In a real implementation, you'd save these to a settings table
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'platform', label: 'Platform', icon: Globe },
    { id: 'uploads', label: 'File Uploads', icon: Image },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'moderation', label: 'Moderation', icon: Shield },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Admin
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">System Settings</h1>
            </div>
            
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                {/* Platform Settings */}
                {activeTab === 'platform' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Configuration</h2>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Platform Name
                          </label>
                          <input
                            type="text"
                            value={settings.platform_name}
                            onChange={(e) => setSettings({...settings, platform_name: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Platform Description
                          </label>
                          <textarea
                            value={settings.platform_description}
                            onChange={(e) => setSettings({...settings, platform_description: e.target.value})}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Support Email
                          </label>
                          <input
                            type="email"
                            value={settings.support_email}
                            onChange={(e) => setSettings({...settings, support_email: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                            <div>
                              <h3 className="font-medium text-yellow-800">Maintenance Mode</h3>
                              <p className="text-sm text-yellow-700">Temporarily disable public access</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.maintenance_mode}
                              onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Settings */}
                {activeTab === 'uploads' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">File Upload Configuration</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max File Size (MB)
                          </label>
                          <input
                            type="number"
                            value={settings.max_file_size_mb}
                            onChange={(e) => setSettings({...settings, max_file_size_mb: parseInt(e.target.value)})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Max Files Per Post
                          </label>
                          <input
                            type="number"
                            value={settings.max_files_per_post}
                            onChange={(e) => setSettings({...settings, max_files_per_post: parseInt(e.target.value)})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allowed File Types
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {settings.allowed_file_types.map((type, index) => (
                            <Badge key={index} variant="outline">
                              {type}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Current: JPEG, PNG, WebP images and MP4, WebM videos
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Settings */}
                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Pricing</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Free Tier */}
                        <div className="border rounded-lg p-6">
                          <h3 className="font-semibold text-gray-900 mb-4">Free Tier Limits</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Post Limit
                              </label>
                              <input
                                type="number"
                                value={settings.free_tier_post_limit}
                                onChange={(e) => setSettings({...settings, free_tier_post_limit: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Images per Post
                              </label>
                              <input
                                type="number"
                                value={settings.free_tier_image_limit}
                                onChange={(e) => setSettings({...settings, free_tier_image_limit: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (Days)
                              </label>
                              <input
                                type="number"
                                value={settings.free_tier_duration_days}
                                onChange={(e) => setSettings({...settings, free_tier_duration_days: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Premium Pricing */}
                        <div className="border rounded-lg p-6 bg-emerald-50">
                          <h3 className="font-semibold text-gray-900 mb-4">Premium Tier</h3>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Monthly Price (ZAR)
                            </label>
                            <input
                              type="number"
                              value={settings.premium_price_monthly}
                              onChange={(e) => setSettings({...settings, premium_price_monthly: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        </div>

                        {/* Business Pricing */}
                        <div className="border rounded-lg p-6 bg-purple-50">
                          <h3 className="font-semibold text-gray-900 mb-4">Business Tier</h3>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Monthly Price (ZAR)
                            </label>
                            <input
                              type="number"
                              value={settings.business_price_monthly}
                              onChange={(e) => setSettings({...settings, business_price_monthly: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Moderation Settings */}
                {activeTab === 'moderation' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Moderation</h2>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center">
                            <Shield className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                              <h3 className="font-medium text-blue-800">Auto Moderation</h3>
                              <p className="text-sm text-blue-700">Automatically flag suspicious content</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.auto_moderation_enabled}
                              onChange={(e) => setSettings({...settings, auto_moderation_enabled: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-amber-600 mr-3" />
                            <div>
                              <h3 className="font-medium text-amber-800">Require Approval</h3>
                              <p className="text-sm text-amber-700">New users need approval before posting</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.require_approval_new_users}
                              onChange={(e) => setSettings({...settings, require_approval_new_users: e.target.checked})}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Flagged Content Threshold
                          </label>
                          <input
                            type="number"
                            value={settings.flagged_content_threshold}
                            onChange={(e) => setSettings({...settings, flagged_content_threshold: parseInt(e.target.value)})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Number of reports before content is automatically hidden
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
