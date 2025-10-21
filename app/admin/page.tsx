'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { 
  Users, 
  BadgeCheck, 
  FileText, 
  Settings, 
  BarChart3, 
  Trash2,
  Shield,
  Crown,
  TrendingUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AdminStats {
  total_users: number
  verified_sellers: number
  total_posts: number
  active_posts: number
  premium_users: number
  free_users: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login-animated')
      return
    }
    checkAdminAccess()
    fetchStats()
  }, [user])

  const checkAdminAccess = async () => {
    try {
      // Check if user has admin role in database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      if (profile?.is_admin) {
        setIsAdmin(true)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    }
  }

  const fetchStats = async () => {
    try {
      // Get user stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: verifiedSellers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verified_seller', true)

      const { count: premiumUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('subscription_tier', ['premium', 'business'])

      const { count: freeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_tier', 'free')

      // Get post stats
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })

      const { count: activePosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      setStats({
        total_users: totalUsers || 0,
        verified_sellers: verifiedSellers || 0,
        total_posts: totalPosts || 0,
        active_posts: activePosts || 0,
        premium_users: premiumUsers || 0,
        free_users: freeUsers || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">
          {loading ? 'Loading...' : 'Access Denied'}
        </div>
      </div>
    )
  }

  const adminTools = [
    {
      title: 'Verified Sellers',
      description: 'Manage verified seller badges',
      icon: BadgeCheck,
      href: '/admin/verified-sellers',
      color: 'bg-blue-100 text-blue-600',
      stats: `${stats?.verified_sellers || 0} verified`,
    },
    {
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-emerald-100 text-emerald-600',
      stats: `${stats?.total_users || 0} users`,
    },
    {
      title: 'Content Moderation',
      description: 'Review and moderate listings',
      icon: FileText,
      href: '/admin/moderation',
      color: 'bg-purple-100 text-purple-600',
      stats: `${stats?.active_posts || 0} active`,
    },
    {
      title: 'Cleanup Monitor',
      description: 'Monitor auto-deletion system',
      icon: Trash2,
      href: '/admin/cleanup',
      color: 'bg-red-100 text-red-600',
      stats: 'View logs',
    },
    {
      title: 'Analytics',
      description: 'Platform performance metrics',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-amber-100 text-amber-600',
      stats: 'Coming soon',
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-100 text-gray-600',
      stats: 'Configure',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
              <p className="text-gray-600">Manage your A2Z platform</p>
            </div>
            <Link 
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Dashboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</p>
                <p className="text-sm text-gray-500">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BadgeCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.verified_sellers || 0}</p>
                <p className="text-sm text-gray-500">Verified Sellers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.active_posts || 0}</p>
                <p className="text-sm text-gray-500">Active Posts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.premium_users || 0}</p>
                <p className="text-sm text-gray-500">Premium Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Tools Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminTools.map((tool, index) => (
              <Link
                key={index}
                href={tool.href}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {tool.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {tool.stats}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Platform Health</h3>
              <p className="text-emerald-50">
                {stats?.free_users || 0} free users • {stats?.premium_users || 0} premium users • {stats?.active_posts || 0} active listings
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              <span className="text-3xl font-bold">
                {Math.round(((stats?.premium_users || 0) / (stats?.total_users || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
