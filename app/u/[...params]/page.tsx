import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { PublicListingCard } from '@/components/PublicListingCard'
import { ShareSection } from '@/components/ShareSection'
import { ViewTracker } from '@/components/ViewTracker'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'

// Use Edge Runtime to avoid file tracing issues
export const runtime = 'edge'

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
  params: Promise<{ params: string[] }>
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
  const { params: routeParams } = await params
  
  if (routeParams.length !== 2) {
    return { title: 'Post Not Found - A2Z' }
  }
  
  const [username, slug] = routeParams
  const post = await getPost(username, slug)

  if (!post) {
    return {
      title: 'Post Not Found - A2Z',
    }
  }

  const price = formatPrice(post.price_cents, post.currency)
  const baseUrl =
    process.env.NEXT_PUBLIC_SELLR_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const publicUrl = `${baseUrl}/u/${username}/${post.slug}`

  // Clean description for better social sharing
  const cleanDescription = post.description 
    ? post.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160)
    : `${post.title} for ${price}. Contact ${username} on WhatsApp.`

  // ALWAYS use generated OG image - most reliable for WhatsApp
  // Product images may have CORS or accessibility issues
  const socialImage = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}&price=${encodeURIComponent(price)}&username=${encodeURIComponent(username)}`

  return {
    title: `${post.title} - ${price} | ${username} on A2Z`,
    description: cleanDescription,
    openGraph: {
      title: `${post.title} - ${price}`,
      description: cleanDescription,
      url: publicUrl,
      siteName: 'A2Z Marketplace',
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: `${post.title} - ${price} on A2Z`,
          type: 'image/jpeg',
        }
      ],
      locale: 'en_ZA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - ${price}`,
      description: cleanDescription,
      images: [socialImage],
    },
    alternates: {
      canonical: publicUrl,
    },
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/png',
      'og:image:secure_url': socialImage,
      'twitter:image': socialImage,
      'twitter:image:alt': `${post.title} - ${price} on A2Z`,
      'twitter:card': 'summary_large_image',
    },
  }
}

export default async function UserListingPage({ params }: PageProps) {
  const { params: routeParams } = await params
  
  console.log('🚀 Route called with params:', { routeParams })
  
  // Expect [username, slug] format
  if (routeParams.length !== 2) {
    console.log('❌ Invalid params length:', routeParams.length)
    notFound()
  }
  
  const [username, slug] = routeParams
  
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* View Tracker */}
        <ViewTracker postId={post.id} />
        
        {/* Post Card */}
        <PublicListingCard 
          post={post}
        />

        {/* WhatsApp Community */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-lg font-bold">
            Join our a2z Sellr - WhatsApp community{' '}
            <a
              href="https://chat.whatsapp.com/DIAWnwbUTE0LO2kifr6tGu?mode=wwt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-extrabold underline bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent animate-pulse"
            >
              here
            </a>
          </p>
        </div>

        {/* Share Section */}
        <ShareSection post={post} username={username} />

        {/* Back to A2Z */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Create your own listing on A2Z
          </Link>
        </div>
      </div>
    </div>
  )
}
