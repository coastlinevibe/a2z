import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { PostCard } from '@/components/PostCard'
import { formatPrice, generateShareMessage } from '@/lib/utils'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ username: string; slug: string }>
}

async function getPost(username: string, slug: string) {
  // First get the user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (!profile) {
    return null
  }

  // Then get the post
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('owner', profile.id)
    .eq('is_active', true)
    .single()

  if (error || !post) {
    return null
  }

  return { ...post, username }
}

async function incrementViews(postId: string) {
  'use server'
  try {
    const base =
      process.env.NEXT_PUBLIC_SELLR_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    await fetch(`${base}/api/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view' }),
      cache: 'no-store',
    })
  } catch {}
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params
  const post = await getPost(username, slug)

  if (!post) {
    return {
      title: 'Post Not Found - Sellr',
    }
  }

  const price = formatPrice(post.price_cents, post.currency)
  const baseUrl =
    process.env.NEXT_PUBLIC_SELLR_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const publicUrl = `${baseUrl}/${username}/${post.slug}`

  return {
    title: `${post.title} - ${price} | ${username} on Sellr`,
    description: post.description || `${post.title} for ${price}. Contact ${username} on WhatsApp.`,
    openGraph: {
      title: `${post.title} - ${price}`,
      description: post.description || `${post.title} for ${price}`,
      url: publicUrl,
      siteName: 'Sellr',
      images: post.media_urls.length > 0 ? [
        {
          url: post.media_urls[0],
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
      locale: 'en_ZA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - ${price}`,
      description: post.description || `${post.title} for ${price}`,
      images: post.media_urls.length > 0 ? [post.media_urls[0]] : [],
    },
    alternates: {
      canonical: publicUrl,
    },
  }
}

export default async function UserListingPage({ params }: PageProps) {
  const { username, slug } = await params
  const post = await getPost(username, slug)

  if (!post) {
    notFound()
  }

  // Increment views
  incrementViews(post.id)

  const baseUrl =
    process.env.NEXT_PUBLIC_SELLR_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const publicUrl = `${baseUrl}/${username}/${post.slug}`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4">
          <Link
            href={`/${username}`}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back to @{username}&apos;s profile
          </Link>
        </div>

        {/* Post Card */}
        <PostCard 
          post={post}
          trackViews={false}
        />

        {/* Share Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Share This Listing
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copy Link
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={publicUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicUrl)
                    alert('Link copied!')
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Message
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {generateShareMessage(
                    post.title,
                    formatPrice(post.price_cents, post.currency),
                    publicUrl
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Sellr */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Create your own listing on Sellr
          </Link>
        </div>
      </div>
    </div>
  )
}
