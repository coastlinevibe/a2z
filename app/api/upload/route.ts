import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize } = await request.json()

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm'
    ]

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size too large (max 10MB)' },
        { status: 400 }
      )
    }

    // Generate unique file name
    const fileExtension = fileName.split('.').pop()
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const filePath = `posts/${uniqueFileName}`

    // Create signed URL for upload
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('posts')
      .createSignedUploadUrl(filePath)

    if (uploadError) {
      console.error('Supabase upload URL error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('posts')
      .getPublicUrl(filePath)

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      publicUrl: publicUrlData.publicUrl,
      filePath,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
