import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'

// Force Node.js runtime instead of Edge
export const runtime = 'nodejs'

// Create admin client for server-side operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  console.log('🔥 OPTIONS handler called')
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔥 UPLOAD API v2.3 - Env check')
    
    // Check environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('SUPABASE_URL exists:', !!supabaseUrl)
    console.log('SERVICE_KEY exists:', !!serviceKey)
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({
        error: 'Environment variables missing',
        supabaseUrl: !!supabaseUrl,
        serviceKey: !!serviceKey
      }, { status: 500 })
    }
    
    console.log('✅ Environment variables OK')
    return NextResponse.json({ message: 'Environment OK, function works!' })
  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
