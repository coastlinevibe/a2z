'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Trash2, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  FileText,
  RefreshCw,
  Play,
  Pause,
  Shield
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface CleanupLog {
  id: string
  user_id: string
  username: string
  posts_deleted: number
  images_deleted: number
  executed_at: string
  status: 'success' | 'error' | 'partial'
  error_message?: string
}

interface UserResetInfo {
  id: string
  username: string
  email: string
  created_at: string
  last_free_reset: string | null
  current_listings: number
  days_until_reset: number
  subscription_tier: 'free' | 'premium' | 'business'
}

export default function CleanupMonitor() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<CleanupLog[]>([])
  const [upcomingResets, setUpcomingResets] = useState<UserResetInfo[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'logs' | 'upcoming'>('logs')
  const [systemStatus, setSystemStatus] = useState({
    enabled: true,
    last_run: '2024-01-20T10:00:00Z',
    next_run: '2024-01-21T10:00:00Z',
    total_resets: 156,
    total_posts_cleaned: 1240,
    total_images_cleaned: 3420
  })

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
      await loadData()
    } catch (error) {
      console.error('Admin access check failed:', error)
      router.push('/admin/login')
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load free users and calculate reset info
      const { data: freeUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, email, created_at, last_free_reset, current_listings, subscription_tier')
        .eq('subscription_tier', 'free')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Calculate days until reset for each user
      const usersWithResetInfo = freeUsers?.map(user => {
        const createdDate = new Date(user.created_at)
        const lastReset = user.last_free_reset ? new Date(user.last_free_reset) : createdDate
        const daysSinceReset = Math.floor((Date.now() - lastReset.getTime()) / (1000 * 60 * 60 * 24))
        const daysUntilReset = Math.max(0, 7 - daysSinceReset)
        
        return {
          ...user,
          days_until_reset: daysUntilReset
        }
      }).filter(user => user.days_until_reset <= 2) || [] // Show users with reset in next 2 days

      setUpcomingResets(usersWithResetInfo)

      // Generate mock cleanup logs (in real app, this would come from a logs table)
      const mockLogs: CleanupLog[] = [
        {
          id: '1',
          user_id: 'user1',
          username: 'testuser1',
          posts_deleted: 3,
          images_deleted: 8,
          executed_at: '2024-01-20T10:00:00Z',
          status: 'success'
        },
        {
          id: '2',
          user_id: 'user2',
          username: 'testuser2',
          posts_deleted: 2,
          images_deleted: 5,
          executed_at: '2024-01-19T10:00:00Z',
          status: 'success'
        },
        {
          id: '3',
          user_id: 'user3',
          username: 'testuser3',
          posts_deleted: 0,
          images_deleted: 0,
          executed_at: '2024-01-18T10:00:00Z',
          status: 'error',
          error_message: 'Storage deletion failed'
        }
      ]

      setLogs(mockLogs)
    } catch (error) {
      console.error('Failed to load cleanup data:', error)
    } finally {
      setLoading(false)
    }
  }

  const runManualCleanup = async () => {
    if (!confirm('Are you sure you want to run manual cleanup? This will reset all eligible free accounts.')) {
      return
    }

    try {
      // In a real implementation, this would trigger the cleanup API
      alert('Manual cleanup initiated. Check logs for results.')
      await loadData()
    } catch (error) {
      console.error('Failed to run manual cleanup:', error)
      alert('Failed to run manual cleanup')
    }
  }

  const toggleSystemStatus = async () => {
    try {
      setSystemStatus(prev => ({ ...prev, enabled: !prev.enabled }))
      // In a real implementation, this would update system settings
      alert(`Cleanup system ${systemStatus.enabled ? 'disabled' : 'enabled'}`)
    } catch (error) {
      console.error('Failed to toggle system status:', error)
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
              <h1 className="text-xl font-semibold text-gray-900">Cleanup Monitor</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge 
                variant={systemStatus.enabled ? "default" : "secondary"}
                className={systemStatus.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {systemStatus.enabled ? 'Active' : 'Disabled'}
              </Badge>
              
              <button
                onClick={toggleSystemStatus}
                className={`px-4 py-2 rounded-lg font-medium ${
                  systemStatus.enabled 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {systemStatus.enabled ? (
                  <>
                    <Pause className="h-4 w-4 mr-2 inline" />
                    Disable
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2 inline" />
                    Enable
                  </>
                )}
              </button>
              
              <button
                onClick={runManualCleanup}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                <RefreshCw className="h-4 w-4 mr-2 inline" />
                Run Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Resets</p>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.total_resets}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Posts Cleaned</p>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.total_posts_cleaned}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images Cleaned</p>
                <p className="text-2xl font-bold text-gray-900">{systemStatus.total_images_cleaned}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Trash2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Run</p>
                <p className="text-sm font-bold text-gray-900">{formatRelativeTime(systemStatus.next_run)}</p>
                <p className="text-xs text-gray-500">{formatDate(systemStatus.next_run)}</p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'logs'
                    ? 'border-b-2 border-emerald-500 text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Cleanup Logs
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'upcoming'
                    ? 'border-b-2 border-emerald-500 text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming Resets ({upcomingResets.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <>
                {/* Cleanup Logs */}
                {activeTab === 'logs' && (
                  <div className="space-y-4">
                    {logs.length === 0 ? (
                      <div className="text-center py-12">
                        <Trash2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No cleanup logs</h3>
                        <p className="text-gray-600">Cleanup logs will appear here after the system runs.</p>
                      </div>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${
                              log.status === 'success' ? 'bg-green-100' :
                              log.status === 'error' ? 'bg-red-100' : 'bg-yellow-100'
                            }`}>
                              {log.status === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : log.status === 'error' ? (
                                <XCircle className="h-5 w-5 text-red-600" />
                              ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                              )}
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">@{log.username}</span>
                                <Badge variant="outline">{log.status}</Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                {log.posts_deleted} posts, {log.images_deleted} images deleted
                              </div>
                              {log.error_message && (
                                <div className="text-sm text-red-600 mt-1">
                                  Error: {log.error_message}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {formatRelativeTime(log.executed_at)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDate(log.executed_at)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Upcoming Resets */}
                {activeTab === 'upcoming' && (
                  <div className="space-y-4">
                    {upcomingResets.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming resets</h3>
                        <p className="text-gray-600">No free accounts are scheduled for reset in the next 2 days.</p>
                      </div>
                    ) : (
                      upcomingResets.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-yellow-600" />
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">@{user.username}</span>
                                <Badge variant="outline">{user.subscription_tier}</Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                {user.current_listings} active listings • Member since {formatDate(user.created_at)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              user.days_until_reset === 0 ? 'text-red-600' :
                              user.days_until_reset === 1 ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                              {user.days_until_reset === 0 ? 'Today' :
                               user.days_until_reset === 1 ? 'Tomorrow' :
                               `${user.days_until_reset} days`}
                            </div>
                            <div className="text-xs text-gray-400">
                              Reset due
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
