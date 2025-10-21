import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'

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
    console.log('🔥 UPLOAD API v2.5 - Full Supabase upload with enhanced logging')
    console.log('Environment check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })
    
    const supabaseAdmin = getSupabaseAdmin()
    
    // Get user session from Authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid auth header')
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.id)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const postId = formData.get('postId') as string | null
    
    console.log('File received:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    })
    
    if (!file) {
      console.error('No file in form data')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large (max 10MB)' },
        { status: 400 }
      )
    }

    // Generate unique file name
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = `posts/${uniqueFileName}`

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()

    console.log('Starting upload to Supabase Storage:', filePath)
    
    // Upload directly to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('posts')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { error: `Failed to upload file: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Upload successful:', data.path)

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('posts')
      .getPublicUrl(filePath)

    console.log('Generated public URL:', publicUrlData.publicUrl)

    return NextResponse.json({
      publicUrl: publicUrlData.publicUrl,
      filePath: data.path
    })
  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
