import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { PublicListingCard } from '@/components/PublicListingCard'
import { formatPrice, generateShareMessage } from '@/lib/utils'
import type { Metadata } from 'next'

interface PageProps {
  params: { slug: string }
}

async function getPost(slug: string) {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !post) {
    return null
  }

  return post
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found - Sellr',
    }
  }

  const price = formatPrice(post.price_cents, post.currency)
  const baseUrl =
    process.env.NEXT_PUBLIC_SELLR_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const publicUrl = `${baseUrl}/p/${post.slug}`

  // Use actual product image - this is what was working before
  let socialImage = post.media_urls && post.media_urls.length > 0 ? post.media_urls[0] : ''
  
  // Ensure image URL is absolute
  if (socialImage && !socialImage.startsWith('http')) {
    socialImage = `${baseUrl}${socialImage.startsWith('/') ? '' : '/'}${socialImage}`
  }
  
  // Only use generated OG as last resort if no product image
  if (!socialImage) {
    socialImage = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}&price=${encodeURIComponent(price)}&username=Seller`
  }

  return {
    title: `${post.title} - ${price} | Sellr`,
    description: post.description || `${post.title} for ${price}. Contact seller on WhatsApp.`,
    openGraph: {
      title: `${post.title} - ${price}`,
      description: post.description || `${post.title} for ${price}. Contact seller on WhatsApp.`,
      url: publicUrl,
      siteName: 'Sellr',
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ],
      locale: 'en_ZA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} - ${price}`,
      description: post.description || `${post.title} for ${price}. Contact seller on WhatsApp.`,
      images: [socialImage],
    },
    alternates: {
      canonical: publicUrl,
    },
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
      // Don't revalidate cache on this analytics call
      cache: 'no-store',
    })
  } catch {}
}

async function handleAnalytics(postId: string, action: 'view' | 'click') {
  'use server'
  
  await fetch(`${process.env.NEXT_PUBLIC_SELLR_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/api/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
}

export default async function PublicPostPage({ params }: PageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  // Increment views (server-side) without blocking the render
  incrementViews(post.id)

  const handleWhatsAppClick = async () => {
    'use server'
    await handleAnalytics(post.id, 'click')
  }

  const handleCallClick = async () => {
    'use server'
    await handleAnalytics(post.id, 'click')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Post Card */}
        <PublicListingCard 
          post={post}
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
                  value={`${process.env.NEXT_PUBLIC_SELLR_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/p/${post.slug}`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SELLR_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/p/${post.slug}`)
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
                    `${process.env.NEXT_PUBLIC_SELLR_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')}/p/${post.slug}`
                  )}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Sellr */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Create your own listing on Sellr
          </a>
        </div>
      </div>
    </div>
  )
}
