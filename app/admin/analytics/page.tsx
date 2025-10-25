'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Crown,
  Shield
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface AnalyticsData {
  // User metrics
  total_users: number
  new_users_today: number
  new_users_week: number
  active_users_week: number
  
  // Subscription metrics
  free_users: number
  premium_users: number
  business_users: number
  conversion_rate: number
  
  // Content metrics
  total_posts: number
  active_posts: number
  posts_today: number
  posts_week: number
  
  // Engagement metrics
  total_views: number
  total_clicks: number
  avg_views_per_post: number
  click_through_rate: number
  
  // Top performers
  top_posts: Array<{
    id: string
    title: string
    views: number
    clicks: number
    username: string
  }>
  
  top_users: Array<{
    username: string
    posts_count: number
    total_views: number
    subscription_tier: string
  }>
}

export default function Analytics() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

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
      await loadAnalytics()
    } catch (error) {
      console.error('Admin access check failed:', error)
      router.push('/admin/login')
    }
  }

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Get date ranges
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      // User metrics
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, username, created_at, subscription_tier, last_sign_in_at')

      const totalUsers = allUsers?.length || 0
      const newUsersToday = allUsers?.filter(u => 
        new Date(u.created_at) >= today
      ).length || 0
      const newUsersWeek = allUsers?.filter(u => 
        new Date(u.created_at) >= weekAgo
      ).length || 0
      const activeUsersWeek = allUsers?.filter(u => 
        u.last_sign_in_at && new Date(u.last_sign_in_at) >= weekAgo
      ).length || 0

      // Subscription breakdown
      const freeUsers = allUsers?.filter(u => u.subscription_tier === 'free').length || 0
      const premiumUsers = allUsers?.filter(u => u.subscription_tier === 'premium').length || 0
      const businessUsers = allUsers?.filter(u => u.subscription_tier === 'business').length || 0
      const conversionRate = totalUsers > 0 ? ((premiumUsers + businessUsers) / totalUsers) * 100 : 0

      // Post metrics
      const { data: allPosts } = await supabase
        .from('posts')
        .select('id, created_at, is_active, views, clicks, owner, title')

      const totalPosts = allPosts?.length || 0
      const activePosts = allPosts?.filter(p => p.is_active).length || 0
      const postsToday = allPosts?.filter(p => 
        new Date(p.created_at) >= today
      ).length || 0
      const postsWeek = allPosts?.filter(p => 
        new Date(p.created_at) >= weekAgo
      ).length || 0

      // Engagement metrics
      const totalViews = allPosts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0
      const totalClicks = allPosts?.reduce((sum, post) => sum + (post.clicks || 0), 0) || 0
      const avgViewsPerPost = totalPosts > 0 ? totalViews / totalPosts : 0
      const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

      // Top posts
      const topPosts = allPosts
        ?.sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(post => {
          const user = allUsers?.find(u => u.id === post.owner)
          return {
            id: post.id,
            title: post.title,
            views: post.views || 0,
            clicks: post.clicks || 0,
            username: user?.username || 'Unknown'
          }
        }) || []

      // Top users by post count
      const userPostCounts = allUsers?.map(user => {
        const userPosts = allPosts?.filter(p => p.owner === user.id) || []
        const totalUserViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0)
        return {
          username: user.username || 'Unknown',
          posts_count: userPosts.length,
          total_views: totalUserViews,
          subscription_tier: user.subscription_tier || 'free'
        }
      }).sort((a, b) => b.posts_count - a.posts_count).slice(0, 5) || []

      setAnalytics({
        total_users: totalUsers,
        new_users_today: newUsersToday,
        new_users_week: newUsersWeek,
        active_users_week: activeUsersWeek,
        free_users: freeUsers,
        premium_users: premiumUsers,
        business_users: businessUsers,
        conversion_rate: conversionRate,
        total_posts: totalPosts,
        active_posts: activePosts,
        posts_today: postsToday,
        posts_week: postsWeek,
        total_views: totalViews,
        total_clicks: totalClicks,
        avg_views_per_post: avgViewsPerPost,
        click_through_rate: clickThroughRate,
        top_posts: topPosts,
        top_users: userPostCounts
      })

    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
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

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )

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
              <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
            </div>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={analytics?.total_users?.toLocaleString()}
                icon={Users}
                color="bg-blue-500"
              />
              <StatCard
                title="Active Posts"
                value={analytics?.active_posts?.toLocaleString()}
                icon={Activity}
                color="bg-emerald-500"
              />
              <StatCard
                title="Total Views"
                value={analytics?.total_views?.toLocaleString()}
                icon={Eye}
                color="bg-purple-500"
              />
              <StatCard
                title="Click Rate"
                value={`${analytics?.click_through_rate?.toFixed(1)}%`}
                icon={MousePointer}
                color="bg-amber-500"
              />
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">New today</span>
                    <span className="font-medium">{analytics?.new_users_today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New this week</span>
                    <span className="font-medium">{analytics?.new_users_week}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active this week</span>
                    <span className="font-medium">{analytics?.active_users_week}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Tiers</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Free</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{analytics?.free_users}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gray-400 h-2 rounded-full" 
                          style={{ width: `${(analytics?.free_users || 0) / (analytics?.total_users || 1) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Crown className="h-4 w-4 mr-1 text-emerald-500" />
                      Premium
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{analytics?.premium_users}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${(analytics?.premium_users || 0) / (analytics?.total_users || 1) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Business</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{analytics?.business_users}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(analytics?.business_users || 0) / (analytics?.total_users || 1) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="font-medium text-emerald-600">
                      {analytics?.conversion_rate?.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posts today</span>
                    <span className="font-medium">{analytics?.posts_today}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Posts this week</span>
                    <span className="font-medium">{analytics?.posts_week}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg views/post</span>
                    <span className="font-medium">{analytics?.avg_views_per_post?.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Posts */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Posts</h3>
                <div className="space-y-3">
                  {analytics?.top_posts?.map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 truncate">{post.title}</div>
                        <div className="text-sm text-gray-600">by @{post.username}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{post.views} views</div>
                        <div className="text-sm text-gray-600">{post.clicks} clicks</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Users */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Sellers</h3>
                <div className="space-y-3">
                  {analytics?.top_users?.map((user, index) => (
                    <div key={user.username} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-emerald-700">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">@{user.username}</div>
                          <Badge 
                            variant={user.subscription_tier === 'premium' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {user.subscription_tier}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{user.posts_count} posts</div>
                        <div className="text-sm text-gray-600">{user.total_views} views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
