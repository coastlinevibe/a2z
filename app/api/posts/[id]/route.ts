import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
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
    const postId = params.id

    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the user owns this post
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if the post belongs to the user (using admin client to bypass RLS)
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('owner')
      .eq('id', postId)
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    if (post.owner !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this post' },
        { status: 403 }
      )
    }

    // Delete the post (using admin client to bypass RLS)
    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('owner', user.id)

    if (error) {
      console.error('Post delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete post', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Post DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
