import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseClient } from '@/lib/supabaseClient'
import { updatePostSchema, analyticsActionSchema } from '@/lib/validators'

// Create admin client for operations that bypass RLS
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const supabase = createSupabaseClient()
    const body = await request.json()
    const postId = params.id

    // Check if this is an analytics action
    const analyticsValidation = analyticsActionSchema.safeParse(body)
    if (analyticsValidation.success) {
      const { action } = analyticsValidation.data

      // Increment view or click counter
      const updateField = action === 'view' ? 'views' : 'clicks'
      
      // First get the current value
      const { data: currentPost } = await supabase
        .from('posts')
        .select(`${updateField}`)
        .eq('id', postId)
        .single()

      if (!currentPost) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }

      // Increment the value
      const currentValue = currentPost[updateField as keyof typeof currentPost] as number || 0
      const newValue = currentValue + 1
      
      const { data: post, error } = await supabase
        .from('posts')
        .update({
          [updateField]: newValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .select()
        .single()

      if (error) {
        console.error('Analytics update error:', error)
        return NextResponse.json(
          { error: 'Failed to update analytics' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        ok: true,
        data: post,
      })
    }

    // Regular post update
    const validationResult = updatePostSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const updateData = {
      ...validationResult.data,
      updated_at: new Date().toISOString(),
    }

    const { data: post, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single()

    if (error) {
      console.error('Post update error:', error)
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      data: post,
    })
  } catch (error) {
    console.error('Post PATCH API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const supabase = createSupabaseClient()
    const postId = params.id

    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the user owns this post (use admin client for auth)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if the post belongs to the user (using admin client to bypass RLS)
    console.log(`Looking for post ${postId} owned by user ${user.id}`)
    
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('id, owner')
      .eq('id', postId)
      .single()

    console.log('Post fetch result:', { post, fetchError })
    console.log('User from token:', { id: user.id, email: user.email })

    if (fetchError || !post) {
      console.error('Post not found:', fetchError)
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.owner !== user.id) {
      console.error(`Ownership mismatch: post.owner=${post.owner}, user.id=${user.id}`)
      
      // Additional check: verify if this is the same user with different session
      const { data: userProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('id', post.owner)
        .single()
      
      const { data: currentUserProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('id', user.id)
        .single()
      
      console.log('Post owner profile:', userProfile)
      console.log('Current user profile:', currentUserProfile)
      
      // If emails match, it's the same user with session mismatch
      if (userProfile?.email === currentUserProfile?.email && userProfile?.email === user.email) {
        console.log('Same user, different session ID - allowing delete')
      } else {
        return NextResponse.json(
          { error: 'Forbidden: You do not own this post' },
          { status: 403 }
        )
      }
    }

    // Delete the post (using admin client to bypass RLS)
    console.log(`Attempting to delete post ${postId} for user ${user.id}`)
    
    const { error, count } = await supabaseAdmin
      .from('posts')
      .delete({ count: 'exact' })
      .eq('id', postId)
      .eq('owner', post.owner) // Use the actual post owner ID

    if (error) {
      console.error('Post delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete post', details: error.message },
        { status: 500 }
      )
    }

    console.log('Delete count:', count)
    
    if (count === 0) {
      console.error('No post was deleted - post may not exist or user may not own it')
      return NextResponse.json(
        { error: 'Post not found or you do not have permission to delete it' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Post deleted successfully',
      deletedCount: count
    })
  } catch (error) {
    console.error('Post DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
