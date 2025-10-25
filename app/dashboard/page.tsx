'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Plus, Eye, MousePointer, Edit, Trash2, ExternalLink, Share2, ToggleLeft, ToggleRight, Grid, List } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { formatPrice, cn } from '@/lib/utils'
import { ShareModal } from '@/components/ShareModal'
import { PreviewModal } from '@/components/PreviewModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'
import { ListingCardGrid } from '@/components/ListingCardGrid'
import { MediaExpirationWarning } from '@/components/MediaExpirationWarning'
import FreeAccountNotifications from '@/components/FreeAccountNotifications'
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
  const { user, session, loading: authLoading } = useRequireAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [sharePost, setSharePost] = useState<Post | null>(null)
  const [previewPost, setPreviewPost] = useState<Post | null>(null)
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [username, setUsername] = useState<string>('')
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user && !authLoading) {
      fetchPosts()
      fetchUsername()
    }
  }, [user, authLoading])

  const fetchUsername = async () => {
    try {
      // We'll get the username from the posts data when it's fetched
      if (user?.id) {
        setUsername(user.id) // Temporary, will be updated when posts are fetched
      }
    } catch (error) {
      console.error('Failed to set username:', error)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.x) / rect.width) * 100
    const y = ((e.clientY - rect.y) / rect.height) * 100
    ref.current.style.setProperty('--x', x.toString())
    ref.current.style.setProperty('--y', y.toString())
  }

  const refreshUserSession = async () => {
    try {
      const { data: { session: newSession }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error refreshing session:', error)
        return false
      }
      if (newSession) {
        console.log('Session refreshed successfully')
        // Force a page reload to get fresh user data
        window.location.reload()
        return true
      }
      return false
    } catch (error) {
      console.error('Error refreshing session:', error)
      return false
    }
  }

  const fetchPosts = async (forceRefresh = false) => {
    if (!user) return
    
    try {
      // Fetch only the authenticated user's posts with cache-busting
      const url = `/api/posts?owner=${user.id}${forceRefresh ? '&t=' + Date.now() : ''}`
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      const result = await response.json()
      
      if (result.ok) {
        console.log('Fetched posts:', result.data)
        console.log('First post username:', result.data[0]?.username)
        setPosts(result.data)
        
        // Update username from posts data if available
        if (result.data && result.data.length > 0 && result.data[0].username) {
          setUsername(result.data[0].username)
        }
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
    if (!session) {
      alert('Please log in to delete posts')
      return
    }

    // Debug: Show current user info
    console.log('Current user from session:', {
      id: user?.id,
      email: user?.email,
      session_user_id: session.user?.id
    })
    console.log('Attempting to delete post:', postId)

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (response.ok) {
        // Immediately update the UI by removing the post from state
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
        
        // Close the delete modal
        setDeletePostId(null)
        
        // Show success message
        alert('Listing deleted successfully!')
        
        // Force refresh posts to ensure consistency
        setTimeout(() => {
          fetchPosts(true)
        }, 500)
      } else {
        const error = await response.json()
        console.error('Delete failed:', error)
        alert(`Failed to delete: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen py-8" style={{
        backgroundImage: 'linear-gradient(rgba(236, 253, 245, 0.9), rgba(236, 253, 245, 0.9)), url(/images/hero/bg3.png)',
        backgroundSize: 'auto, 150px 150px',
        backgroundRepeat: 'no-repeat, repeat',
        backgroundColor: '#f9fafb'
      }}>
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
    <div className="min-h-screen py-8" style={{
      backgroundImage: 'linear-gradient(rgba(236, 253, 245, 0.9), rgba(236, 253, 245, 0.9)), url(/images/hero/bg3.png)',
      backgroundSize: 'auto, 150px 150px',
      backgroundRepeat: 'no-repeat, repeat',
      backgroundColor: '#f9fafb'
    }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Media Expiration Warning */}
        <div className="mb-4 sm:mb-6">
          <MediaExpirationWarning />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-1">
              Manage your products and track performance
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-0">
            {/* View Toggle */}
            <div className="flex bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === 'grid' 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-r-lg ${
                  viewMode === 'list' 
                    ? 'bg-emerald-600 text-white' 
                    : 'text-gray-600 hover:text-emerald-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            <Link
              href="/create"
              className="bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-sm text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline sm:inline">Create Listing</span>
              <span className="xs:hidden sm:hidden">Create</span>
            </Link>
          </div>
        </div>

        {/* Free Account Notifications */}
        <FreeAccountNotifications />

        {/* Stats Overview */}
        {posts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Views */}
            <div 
              ref={card1Ref}
              onMouseMove={(e) => handleMouseMove(e, card1Ref)}
              className="gooey-card gooey-card-emerald group relative overflow-visible rounded-3xl bg-transparent p-8 transition-all duration-500 hover:scale-105"
              style={{
                '--x': '50',
                '--y': '50',
                '--hue': '170deg',
              } as React.CSSProperties}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="rounded-2xl bg-white/20 backdrop-blur-sm p-3">
                  <Eye className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Total Views</p>
                  <p className="text-4xl font-bold text-white tracking-tight">
                    {posts.reduce((sum, post) => sum + post.views, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Clicks */}
            <div 
              ref={card2Ref}
              onMouseMove={(e) => handleMouseMove(e, card2Ref)}
              className="gooey-card gooey-card-blue group relative overflow-visible rounded-3xl bg-transparent p-8 transition-all duration-500 hover:scale-105"
              style={{
                '--x': '50',
                '--y': '50',
                '--hue': '220deg',
              } as React.CSSProperties}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="rounded-2xl bg-white/20 backdrop-blur-sm p-3">
                  <MousePointer className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Total Clicks</p>
                  <p className="text-4xl font-bold text-white tracking-tight">
                    {posts.reduce((sum, post) => sum + post.clicks, 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Listings */}
            <div 
              ref={card3Ref}
              onMouseMove={(e) => handleMouseMove(e, card3Ref)}
              className="gooey-card gooey-card-purple group relative overflow-visible rounded-3xl bg-transparent p-8 transition-all duration-500 hover:scale-105"
              style={{
                '--x': '50',
                '--y': '50',
                '--hue': '280deg',
              } as React.CSSProperties}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div className="rounded-2xl bg-white/20 backdrop-blur-sm p-3">
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Active Listings</p>
                  <p className="text-4xl font-bold text-white tracking-tight">
                    {posts.filter(post => post.is_active).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @property --a {
            syntax: "<percentage>";
            initial-value: 0%;
            inherits: true;
          }
          @property --hue {
            syntax: "<angle>";
            initial-value: 170deg;
            inherits: false;
          }

          .gooey-card {
            --a: 0%;
            --x: 50;
            --y: 50;
            isolation: isolate;
            position: relative;
          }

          .gooey-card::before {
            content: "";
            position: absolute;
            inset: -4px;
            filter: blur(12px) url(#goo) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
            background-image:
              linear-gradient(0deg, hsl(var(--hue), 66%, 66%), hsl(var(--hue), 66%, 66%)),
              radial-gradient(
                40% 70% at calc(var(--x) * 1%) calc(var(--y) * 1%),
                hsla(var(--hue), 77%, 77%, var(--a)) 0%,
                transparent 90%
              );
            background-clip: content-box, border-box;
            padding: 24px;
            z-index: -1;
            border-radius: inherit;
            animation: gooey-color 20s linear infinite both;
            transition: --a 0.5s ease-in-out;
          }

          .gooey-card:hover::before {
            --a: 100%;
          }

          .gooey-card-emerald {
            --hue: 170deg;
          }
          .gooey-card-blue {
            --hue: 220deg;
          }
          .gooey-card-purple {
            --hue: 280deg;
          }

          @keyframes gooey-color {
            from {
              filter: blur(12px) url(#goo) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3)) hue-rotate(0deg);
            }
            to {
              filter: blur(12px) url(#goo) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3)) hue-rotate(360deg);
            }
          }
        `}</style>

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
              Create your first listing and share it anywhere to start selling.
            </p>
            <Link
              href="/create"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <ListingCardGrid
            posts={posts}
            onShare={(post) => setSharePost(post)}
            onPreview={(post) => setPreviewPost(post)}
            onDelete={(postId) => setDeletePostId(postId)}
          />
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
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                      <button
                        onClick={() => setSharePost(post)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setPreviewPost(post)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setDeletePostId(post.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 hover:scale-110 transition-all duration-200 active:scale-95"
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

        {/* Share Modal */}
        {sharePost && (
          <ShareModal
            isOpen={!!sharePost}
            onClose={() => setSharePost(null)}
            post={sharePost}
            username={username}
          />
        )}

        {/* Preview Modal */}
        {previewPost && (
          <PreviewModal
            isOpen={!!previewPost}
            onClose={() => setPreviewPost(null)}
            post={previewPost}
            onShare={() => {
              setSharePost(previewPost)
              setPreviewPost(null)
            }}
            onDelete={() => {
              setDeletePostId(previewPost.id)
              setPreviewPost(null)
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={!!deletePostId}
          onClose={() => setDeletePostId(null)}
          onConfirm={() => deletePostId && deletePost(deletePostId)}
          itemName={posts.find(p => p.id === deletePostId)?.title}
          message="This action cannot be undone. All data associated with this listing will be permanently deleted."
        />
      </div>
      </div>
    )
  }
