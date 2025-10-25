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
  Eye, 
  EyeOff, 
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  MapPin,
  DollarSign,
  User,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPrice } from '@/lib/utils'

interface PostWithProfile {
  id: string
  title: string
  description: string | null
  price_cents: number
  currency: string
  location: string | null
  media_urls: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  views: number
  clicks: number
  slug: string
  owner: string
  profiles: {
    username: string
    display_name: string | null
    subscription_tier: 'free' | 'premium' | 'business'
    verified_seller: boolean
  }
  reported_count?: number
  flagged_for_review?: boolean
}

export default function ContentModeration() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<PostWithProfile[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTier, setFilterTier] = useState<string>('all')
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
      await loadPosts()
    } catch (error) {
      console.error('Admin access check failed:', error)
      router.push('/admin/login')
    }
  }

  const loadPosts = async () => {
    try {
      setLoading(true)
      
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_owner_fkey (
            username,
            display_name,
            subscription_tier,
            verified_seller
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      setPosts(posts || [])
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePostStatus = async (postId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_active: !currentStatus })
        .eq('id', postId)

      if (error) throw error

      // Refresh posts list
      await loadPosts()
    } catch (error) {
      console.error('Failed to toggle post status:', error)
      alert('Failed to update post status')
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      // Refresh posts list
      await loadPosts()
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && post.is_active) ||
      (filterStatus === 'inactive' && !post.is_active) ||
      (filterStatus === 'flagged' && post.flagged_for_review)

    const matchesTier = filterTier === 'all' || post.profiles?.subscription_tier === filterTier

    return matchesSearch && matchesStatus && matchesTier
  })

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
              <h1 className="text-xl font-semibold text-gray-900">Content Moderation</h1>
            </div>
            <Badge variant="outline" className="text-emerald-700 border-emerald-200">
              {filteredPosts.length} listings
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
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="flagged">Flagged</option>
            </select>

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
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Post Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {post.media_urls && post.media_urls.length > 0 ? (
                    <img
                      src={post.media_urls[0]}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {post.is_active ? (
                      <Badge className="bg-green-100 text-green-800">
                        <Eye className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hidden
                      </Badge>
                    )}
                  </div>

                  {/* Flagged Badge */}
                  {post.flagged_for_review && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="destructive">
                        <Flag className="h-3 w-3 mr-1" />
                        Flagged
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Post Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                    <div className="text-lg font-bold text-emerald-600 ml-2">
                      {formatPrice(post.price_cents, post.currency)}
                    </div>
                  </div>

                  {post.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {post.description.replace(/<[^>]*>/g, '')}
                    </p>
                  )}

                  {/* User Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">@{post.profiles?.username}</span>
                      {post.profiles?.verified_seller && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <Badge 
                      variant={post.profiles?.subscription_tier === 'premium' ? 'default' : 'outline'}
                      className={post.profiles?.subscription_tier === 'premium' ? 'bg-emerald-100 text-emerald-800' : ''}
                    >
                      {post.profiles?.subscription_tier?.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(post.created_at)}
                      </span>
                      {post.location && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {post.location}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>{post.views || 0} views</span>
                      <span>{post.clicks || 0} clicks</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => togglePostStatus(post.id, post.is_active)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          post.is_active 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {post.is_active ? 'Hide' : 'Show'}
                      </button>
                      
                      <button
                        onClick={() => deletePost(post.id)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>

                    <Link
                      href={`/u/${post.profiles?.username}/${post.slug}`}
                      target="_blank"
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View Live →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
