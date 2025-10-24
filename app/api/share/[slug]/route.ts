import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  
  try {
    // Get post with profile data
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_owner_fkey (
          username
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .limit(1)
    
    if (error || !posts || posts.length === 0) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    const post = posts[0]
    const username = post.profiles?.username
    
    if (!username) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Redirect to the listing page
    const baseUrl = process.env.NEXT_PUBLIC_SELLR_BASE_URL || request.nextUrl.origin
    return NextResponse.redirect(new URL(`/${username}/${slug}`, baseUrl))
  } catch (error) {
    console.error('Share API error:', error)
    return NextResponse.redirect(new URL('/', request.url))
  }
}
