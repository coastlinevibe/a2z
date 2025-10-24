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

console.log('🔧 Supabase config:', { 
  url: supabaseUrl, 
  keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon',
  keyLength: supabaseKey?.length 
})

const supabase = createClient(supabaseUrl, supabaseKey)

interface PageProps {
  params: Promise<{ username: string; slug: string }>
}

async function getPost(username: string, slug: string) {
  console.log('🔍 Fetching post:', { username, slug })
  
  try {
    // First get the user by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, verified_seller, display_name')
      .eq('username', username)
      .single()
    
    console.log('👤 Profile query result:', { profile, profileError })
    
    if (profileError || !profile) {
      console.error('❌ Profile fetch error:', { profileError, username })
      return null
    }
    
    // Then get the post by owner and slug
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('owner', profile.id)
      .eq('is_active', true)
      .single()
    
    console.log('📝 Post query result:', { post, postError, profileId: profile.id })
    
    if (postError || !post) {
      console.error('❌ Post fetch error:', { postError, slug, username, profileId: profile.id })
      return null
    }
    
    console.log('✅ Successfully found post:', post.title)
    
    // Combine post and profile data
    return { 
      ...post, 
      username,
      verified_seller: profile?.verified_seller || false,
      seller_name: profile?.display_name || null
    }
  } catch (error) {
    console.error('💥 Unexpected error in getPost:', error)
    return null
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
  
  console.log('🚀 Route called with params:', { username, slug })
  
  // Temporary: Return a simple test page to verify the route works
  if (username === 'test') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1>Route Test Success!</h1>
          <p>Username: {username}</p>
          <p>Slug: {slug}</p>
        </div>
      </div>
    )
  }
  
  const post = await getPost(username, slug)

  if (!post) {
    console.log('❌ Post not found, calling notFound()')
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
