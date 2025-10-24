import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all user's posts with views and clicks
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, views, clicks, created_at, slug')
      .eq('owner', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (postsError) {
      console.error('Posts query error:', postsError)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    // Calculate summary
    const total_views = posts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0
    const total_clicks = posts?.reduce((sum, post) => sum + (post.clicks || 0), 0) || 0
    const total_posts = posts?.length || 0
    const avg_views_per_post = total_posts > 0 ? total_views / total_posts : 0
    const avg_clicks_per_post = total_posts > 0 ? total_clicks / total_posts : 0
    const conversion_rate = total_views > 0 ? (total_clicks / total_views) * 100 : 0

    return NextResponse.json({
      success: true,
      posts: posts || [],
      summary: {
        total_views,
        total_clicks,
        total_posts,
        avg_views_per_post,
        avg_clicks_per_post,
        conversion_rate
      }
    })

  } catch (error) {
    console.error('Analytics stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
