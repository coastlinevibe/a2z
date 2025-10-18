'use client'

import { useState } from 'react'
import { Eye, MousePointer, X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { PostCard } from './PostCard'

interface Post {
  id: string
  title: string
  price_cents: number
  currency: string
  description?: string | null
  emoji_tags: string[]
  media_urls: string[]
  media_descriptions?: string[]
  slug: string
  is_active: boolean
  whatsapp_number?: string | null
  location?: string | null
  display_type?: string | null
  views: number
  clicks: number
  created_at: string
  updated_at: string
}

interface ListingCardGridProps {
  posts: Post[]
  onEdit?: (postId: string) => void
  onShare?: (post: Post) => void
  onPreview?: (post: Post) => void
  onDelete?: (postId: string) => void
}

export function ListingCardGrid({ posts, onEdit, onShare, onPreview, onDelete }: ListingCardGridProps) {
  const [expandedPost, setExpandedPost] = useState<Post | null>(null)

  const openGallery = (post: Post) => {
    setExpandedPost(post)
  }

  const closeGallery = () => {
    setExpandedPost(null)
  }

  // Group posts into rows of 3
  const rows = []
  for (let i = 0; i < posts.length; i += 3) {
    rows.push(posts.slice(i, i + 3))
  }

  return (
    <>
      <div className="max-w-[50rem] mx-auto my-20">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-between mb-10 gap-4">
            {row.map((post) => (
              <div
                key={post.id}
                className={`relative flex-[0_1_15rem] bg-white pb-20 transition-all duration-200 hover:bg-gray-50 cursor-pointer group ${
                  expandedPost?.id === post.id ? 'card-active' : ''
                }`}
                onClick={() => openGallery(post)}
              >
                {/* Card Thumb with 3D effect */}
                <div className="relative w-[15rem] h-[10rem] z-10 perspective-[600px]">
                  {/* Shadows */}
                  <div className="absolute w-[15rem] h-[10rem] bg-emerald-600 opacity-60 transition-all duration-200 group-hover:scale-[1.02] group-hover:translate-y-[-0.3rem]" />
                  <div className="absolute w-[15rem] h-[10rem] bg-emerald-500 opacity-70 transition-all duration-200 group-hover:scale-[0.9] group-hover:translate-y-[1rem]" />
                  <div className="absolute w-[15rem] h-[10rem] bg-emerald-400 opacity-80 transition-all duration-200 group-hover:scale-[0.82] group-hover:translate-y-[2.4rem]" />
                  
                  {/* Main Image */}
                  <div
                    className="absolute w-[15rem] h-[10rem] bg-cover bg-center bg-gray-400 transition-all duration-200 group-hover:scale-105 group-hover:translate-y-[-1rem]"
                    style={{
                      backgroundImage: post.media_urls[0] ? `url(${post.media_urls[0]})` : 'none',
                    }}
                  >
                    <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-40 transition-opacity duration-100" />
                  </div>
                </div>

                {/* Card Title */}
                <div className="absolute bottom-0 flex items-center w-full h-20 text-center transition-all duration-200 group-hover:opacity-0">
                  <span className="flex-1 px-2 text-sm font-medium truncate">{post.title}</span>
                </div>

                {/* Card Explore */}
                <div className="absolute bottom-0 flex items-center w-full h-20 text-center opacity-0 translate-y-[-1rem] group-hover:opacity-100 group-hover:translate-y-[1rem] transition-all duration-200">
                  <span className="flex-1 px-2 text-xs uppercase tracking-wide text-emerald-600">
                    {formatPrice(post.price_cents, post.currency)}
                  </span>
                </div>

                {/* View More Button */}
                <button
                  className="absolute left-1/2 top-20 px-4 py-2 bg-white rounded-full border-2 border-emerald-500 text-emerald-500 text-xs font-semibold -translate-x-1/2 translate-y-8 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-10 hover:bg-emerald-500 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation()
                    openGallery(post)
                  }}
                >
                  view more
                </button>

                {/* Stats Badge */}
                <div className="absolute top-2 right-2 flex gap-2 text-xs text-white z-20">
                  <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                    <Eye className="h-3 w-3" />
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                    <MousePointer className="h-3 w-3" />
                    {post.clicks}
                  </span>
                </div>
              </div>
            ))}
            {/* Fill empty slots */}
            {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, i) => (
              <div key={`empty-${i}`} className="flex-[0_1_15rem]" />
            ))}
          </div>
        ))}
      </div>

      {/* Expanded Post View */}
      {expandedPost && (
        <div className="fixed inset-0 bg-black/50 z-[100] overflow-y-auto flex items-start justify-center p-4 pt-20">
          <div className="relative max-w-3xl w-full">
            <button
              onClick={closeGallery}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="animate-fade-in">
              <PostCard post={expandedPost} showStats={true} trackViews={false} />
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 justify-center">
                {onEdit && (
                  <button
                    onClick={() => {
                      closeGallery()
                      onEdit(expandedPost.id)
                    }}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                )}
                {onShare && (
                  <button
                    onClick={() => {
                      closeGallery()
                      onShare(expandedPost)
                    }}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  >
                    Share
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      closeGallery()
                      onDelete(expandedPost.id)
                    }}
                    className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
