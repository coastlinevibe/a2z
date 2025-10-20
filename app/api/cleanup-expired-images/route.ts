import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Verify authorization (you might want to add API key protection)
    const authHeader = request.headers.get('Authorization')
    const apiKey = request.headers.get('X-API-Key')
    
    // For security, only allow this from authorized sources
    if (!apiKey || apiKey !== process.env.CLEANUP_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      )
    }

    console.log('Manual cleanup triggered via API')

    // Call the Supabase Edge Function
    const { data, error } = await supabaseAdmin.functions.invoke('cleanup-expired-images', {
      body: { manual_trigger: true }
    })

    if (error) {
      console.error('Error calling cleanup Edge Function:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to trigger cleanup',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup triggered successfully',
      result: data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cleanup API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check cleanup status
export async function GET() {
  try {
    // Get recent cleanup stats from database
    const { data, error } = await supabaseAdmin
      .from('media_files')
      .select('user_tier, is_deleted, expires_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    const stats = {
      total_files: data.length,
      active_files: data.filter(f => !f.is_deleted).length,
      deleted_files: data.filter(f => f.is_deleted).length,
      free_tier_files: data.filter(f => f.user_tier === 'free' && !f.is_deleted).length,
      premium_files: data.filter(f => f.user_tier !== 'free' && !f.is_deleted).length,
      files_expiring_soon: data.filter(f => 
        f.expires_at && 
        !f.is_deleted && 
        new Date(f.expires_at) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
      ).length
    }

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cleanup status error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get cleanup status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
