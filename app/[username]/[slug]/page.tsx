import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { PublicListingCard } from '@/components/PublicListingCard'
import { ShareSection } from '@/components/ShareSection'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'

// Server-side Supabase client with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const supabase = createClient(supabaseUrl, supabaseKey)

interface PageProps {
  params: Promise<{ username: string; slug: string }>
}

async function getPost(username: string, slug: string) {
  // Extract numeric ID from user{numericid} format
  const numericId = username.startsWith('user') ? username.replace('user', '') : username
  
  console.log('Fetching post:', { username, slug, numericId })
  
  // Get all posts with this slug, then filter by owner ID in JavaScript
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
  
  console.log('Query result:', { posts, error, count: posts?.length })
  
  // Filter posts where owner UUID starts with numericId
  const post = posts?.find(p => p.owner.toString().startsWith(numericId))
  
  if (error || !post) {
    console.error('Post fetch error:', { error, slug, numericId, foundPosts: posts?.length })
    return null
  }
  
  const userId = post.owner

  // Get profile data separately
  const { data: profile } = await supabase
    .from('profiles')
    .select('verified_seller, display_name')
    .eq('id', userId)
    .single()

  // Combine post and profile data
  return { 
    ...post, 
    username,
    verified_seller: profile?.verified_seller || false,
    seller_name: profile?.display_name || null
  }
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
  } catch (error) {
    console.error('Failed to increment views:', error)
    // Don't fail the page render if analytics fail
  }
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
        <PublicListingCard 
          post={post}
        />

        {/* Share Section */}
        <ShareSection post={post} username={username} />

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
