'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Eye, MousePointer, Edit, Trash2, ExternalLink, Share2, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatPrice, cn } from '@/lib/utils'
import { ShareModal } from '@/components/ShareModal'
import { useRequireAuth } from '@/lib/auth'

interface Post {
  id: string
  title: string
  price_cents: number
  currency: string
  description?: string | null
  emoji_tags: string[]
  media_urls: string[]
  slug: string
  is_active: boolean
  views: number
  clicks: number
  whatsapp_number?: string | null
  location?: string | null
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sharePost, setSharePost] = useState<Post | null>(null)

  useEffect(() => {
    if (user && !authLoading) {
      fetchPosts()
    }
  }, [user, authLoading])

  const fetchPosts = async () => {
    if (!user) return
    
    try {
      // Fetch only the authenticated user's posts
      const response = await fetch('/api/posts?owner=' + user.id)
      const result = await response.json()
      
      if (result.ok) {
        setPosts(result.data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePostStatus = async (postId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, is_active: !isActive } : post
        ))
      }
    } catch (error) {
      console.error('Error toggling post status:', error)
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-1">
              Manage your products and track performance
            </p>
          </div>
          <Link
            href="/create"
            className="mt-4 sm:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Link>
        </div>

        {/* Stats Overview */}
        {posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-emerald-100 rounded-lg p-3">
                  <Eye className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {posts.reduce((sum, post) => sum + post.views, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-lg p-3">
                  <MousePointer className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {posts.reduce((sum, post) => sum + post.clicks, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-lg p-3">
                  <Plus className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {posts.filter(post => post.is_active).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No listings yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first listing to start selling on WhatsApp.
            </p>
            <Link
              href="/create"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Post Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Media Preview */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {post.media_urls.length > 0 && (
                          post.media_urls[0].includes('.mp4') || post.media_urls[0].includes('.webm') ? (
                            <video
                              src={post.media_urls[0]}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={post.media_urls[0]}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          )
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {post.title}
                          </h3>
                          <span className="text-lg font-bold text-emerald-600">
                            {formatPrice(post.price_cents, post.currency)}
                          </span>
                        </div>
                        
                        {post.emoji_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.emoji_tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.emoji_tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{post.emoji_tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views} views
                          </div>
                          <div className="flex items-center">
                            <MousePointer className="h-4 w-4 mr-1" />
                            {post.clicks} clicks
                          </div>
                          <div className={cn(
                            'flex items-center',
                            post.is_active ? 'text-emerald-600' : 'text-gray-400'
                          )}>
                            {post.is_active ? (
                              <ToggleRight className="h-4 w-4 mr-1" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 mr-1" />
                            )}
                            {post.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                      <button
                        onClick={() => togglePostStatus(post.id, post.is_active)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          post.is_active
                            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                        title={post.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {post.is_active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        onClick={() => setSharePost(post)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>

                      <Link
                        href={`/p/${post.slug}`}
                        target="_blank"
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="View Public Page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>

                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {sharePost && (
        <ShareModal
          isOpen={!!sharePost}
          onClose={() => setSharePost(null)}
          post={sharePost}
        />
      )}
    </div>
  )
}
