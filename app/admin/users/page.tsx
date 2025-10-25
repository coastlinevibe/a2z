'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Crown, 
  Shield, 
  UserX, 
  Mail,
  Calendar,
  MoreVertical,
  Ban,
  CheckCircle,
  AlertTriangle,
  Users
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface UserProfile {
  id: string
  username: string
  email: string
  display_name: string | null
  subscription_tier: 'free' | 'premium' | 'business'
  subscription_status: 'active' | 'cancelled' | 'expired' | null
  verified_seller: boolean
  is_admin: boolean
  created_at: string
  last_sign_in_at: string | null
  posts_count: number
  is_banned: boolean
}

export default function UserManagement() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTier, setFilterTier] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isAdmin, setIsAdmin] = useState(false)

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
      await loadUsers()
    } catch (error) {
      console.error('Admin access check failed:', error)
      router.push('/admin/login')
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Get users with post counts
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          email,
          display_name,
          subscription_tier,
          subscription_status,
          verified_seller,
          is_admin,
          created_at,
          last_sign_in_at,
          is_banned
        `)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Get post counts for each user
      const userIds = profiles?.map(p => p.id) || []
      const { data: postCounts, error: postsError } = await supabase
        .from('posts')
        .select('owner')
        .in('owner', userIds)
        .eq('is_active', true)

      if (postsError) throw postsError

      // Combine data
      const usersWithCounts = profiles?.map(profile => ({
        ...profile,
        posts_count: postCounts?.filter(post => post.owner === profile.id).length || 0
      })) || []

      setUsers(usersWithCounts)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserBan = async (userId: string, currentBanStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBanStatus })
        .eq('id', userId)

      if (error) throw error

      // Refresh users list
      await loadUsers()
    } catch (error) {
      console.error('Failed to toggle user ban:', error)
      alert('Failed to update user status')
    }
  }

  const toggleVerifiedSeller = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified_seller: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      // Refresh users list
      await loadUsers()
    } catch (error) {
      console.error('Failed to toggle verified seller:', error)
      alert('Failed to update verified seller status')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTier = filterTier === 'all' || user.subscription_tier === filterTier
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'banned' && user.is_banned) ||
      (filterStatus === 'active' && !user.is_banned) ||
      (filterStatus === 'verified' && user.verified_seller) ||
      (filterStatus === 'admin' && user.is_admin)

    return matchesSearch && matchesTier && matchesStatus
  })

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
              <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
            </div>
            <Badge variant="outline" className="text-emerald-700 border-emerald-200">
              {filteredUsers.length} users
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Tiers</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="business">Business</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="verified">Verified Sellers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-emerald-700">
                                {user.username?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">
                                @{user.username}
                              </div>
                              {user.is_admin && (
                                <Shield className="h-4 w-4 text-red-500" />
                              )}
                              {user.verified_seller && (
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.display_name && (
                              <div className="text-sm text-gray-500">{user.display_name}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={user.subscription_tier === 'premium' ? 'default' : 
                                  user.subscription_tier === 'business' ? 'secondary' : 'outline'}
                          className={user.subscription_tier === 'premium' ? 'bg-emerald-100 text-emerald-800' :
                                    user.subscription_tier === 'business' ? 'bg-purple-100 text-purple-800' : ''}
                        >
                          {user.subscription_tier === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                          {user.subscription_tier?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.posts_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {user.is_banned ? (
                            <Badge variant="destructive">
                              <Ban className="h-3 w-3 mr-1" />
                              Banned
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          {user.subscription_status && (
                            <Badge variant="outline" className="text-xs">
                              {user.subscription_status}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(user.created_at)}
                        </div>
                        {user.last_sign_in_at && (
                          <div className="text-xs text-gray-400 mt-1">
                            Last: {formatDate(user.last_sign_in_at)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {!user.is_admin && (
                            <>
                              <button
                                onClick={() => toggleUserBan(user.id, user.is_banned)}
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                  user.is_banned 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                              >
                                {user.is_banned ? 'Unban' : 'Ban'}
                              </button>
                              
                              {user.subscription_tier === 'premium' && (
                                <button
                                  onClick={() => toggleVerifiedSeller(user.id, user.verified_seller)}
                                  className={`px-3 py-1 rounded text-xs font-medium ${
                                    user.verified_seller
                                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {user.verified_seller ? 'Unverify' : 'Verify'}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
