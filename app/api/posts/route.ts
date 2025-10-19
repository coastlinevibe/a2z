import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPostSchema } from '@/lib/validators'
import { generateUniqueSlug } from '@/lib/utils'
import { getUserTierLimits } from '@/lib/subscription'

// Create a server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get user from authorization header first
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    // Create client-side supabase instance to verify user
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Get user's tier limits to validate against
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    const userTier = userProfile?.subscription_tier || 'free'
    
    // Validate input with tier-specific schema
    const validationResult = createPostSchema(userTier as 'free' | 'premium' | 'business').safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Generate unique slug
    const { data: existingPosts } = await supabaseAdmin
      .from('posts')
      .select('slug')
      .ilike('slug', `${generateUniqueSlug(data.title)}%`)

    const existingSlugs = existingPosts?.map((p: any) => p.slug) || []
    const slug = generateUniqueSlug(data.title, existingSlugs)

    // Extract media descriptions from media_items
    const media_descriptions = data.media_items?.map((item: any) => item.description || '') || []

    // Insert post
    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        owner: user.id,
        title: data.title,
        price_cents: data.price_cents,
        currency: data.currency,
        description: data.description,
        emoji_tags: data.emoji_tags,
        media_urls: data.media_urls,
        media_descriptions,
        slug,
        whatsapp_number: data.whatsapp_number,
        location: data.location,
        display_type: data.display_type || 'hover',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    // Get user's username to add to the post
    const { data: postProfile } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    // Add username to the post for immediate use in ShareModal
    const postWithUsername = {
      ...post,
      username: postProfile?.username || null
    }

    return NextResponse.json({
      ok: true,
      data: postWithUsername,
    })
  } catch (error) {
    console.error('Posts API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner')
    
    let query = supabaseAdmin
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by owner if provided (for dashboard)
    if (owner) {
      query = query.eq('owner', owner)
    } else {
      // Only show active posts for public listings
      query = query.eq('is_active', true)
    }

    let { data: posts, error } = await query

    if (error) {
      console.error('Supabase select error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    // Add username to posts that don't have it
    if (posts && owner) {
      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('id', owner)
        .single()

      if (ownerProfile?.username) {
        posts = posts.map(post => ({
          ...post,
          username: post.username || ownerProfile.username
        }))
      }
    }

    return NextResponse.json({
      ok: true,
      data: posts,
    })
  } catch (error) {
    console.error('Posts GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
