import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { updatePostSchema, analyticsActionSchema } from '@/lib/validators'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    const postId = params.id

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Post delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete post' },
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
