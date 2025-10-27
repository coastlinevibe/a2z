import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const slug = searchParams.get('slug')

    if (!username || !slug) {
      return NextResponse.json(
        { error: 'Missing username or slug' },
        { status: 400 }
      )
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, verified_seller, display_name')
      .eq('username', username)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found', details: profileError },
        { status: 404 }
      )
    }

    // Get post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('owner', profile.id)
      .eq('is_active', true)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found', details: postError },
        { status: 404 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_SELLR_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    // Generate metadata same way as page
    const price = `${post.currency} ${(post.price_cents / 100).toFixed(2)}`
    const cleanDescription = post.description 
      ? post.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 160)
      : `${post.title} for ${price}. Contact ${username} on WhatsApp.`

    let socialImage = ''
    if (post.media_urls && post.media_urls.length > 0) {
      socialImage = post.media_urls[0]
    } else {
      socialImage = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}&price=${encodeURIComponent(price)}&username=${encodeURIComponent(username)}`
    }

    if (socialImage && !socialImage.startsWith('http')) {
      socialImage = `${baseUrl}${socialImage.startsWith('/') ? '' : '/'}${socialImage}`
    }

    if (!socialImage || socialImage.trim() === '') {
      socialImage = `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}&price=${encodeURIComponent(price)}&username=${encodeURIComponent(username)}`
    }

    const publicUrl = `${baseUrl}/u/${username}/${post.slug}`

    return NextResponse.json({
      ok: true,
      metadata: {
        title: `${post.title} - ${price} | ${username} on A2Z`,
        description: cleanDescription,
        url: publicUrl,
        image: socialImage,
        imageWidth: 1200,
        imageHeight: 630,
        post: {
          title: post.title,
          slug: post.slug,
          price: price,
          mediaUrls: post.media_urls,
          mediaUrlsCount: post.media_urls?.length || 0,
        },
        profile: {
          username: profile.username,
          displayName: profile.display_name,
          verifiedSeller: profile.verified_seller,
        }
      }
    })
  } catch (error) {
    console.error('Metadata debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
