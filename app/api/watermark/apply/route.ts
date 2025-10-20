import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addWatermarkServer } from '@/lib/watermark/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('user_id') as string
    const position = (formData.get('position') as string) || 'bottom-right'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Check user's subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    const shouldWatermark = profile?.subscription_tier === 'free' || !profile?.subscription_tier

    if (!shouldWatermark) {
      return NextResponse.json({ 
        error: 'Watermark not needed for premium users',
        watermarked: false 
      }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Apply watermark
    const watermarkedBuffer = await addWatermarkServer(buffer, {
      text: 'A2Z.co.za',
      position: position as any,
      opacity: 0.6,
      fontSize: 48,
      padding: 40
    })

    // Return watermarked image
    return new NextResponse(watermarkedBuffer as any, {
      headers: {
        'Content-Type': file.type || 'image/jpeg',
        'Content-Disposition': `attachment; filename="watermarked_${file.name}"`,
      },
    })

  } catch (error) {
    console.error('Watermark API error:', error)
    return NextResponse.json(
      { error: 'Failed to apply watermark' },
      { status: 500 }
    )
  }
}

// Get watermark status for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    const shouldWatermark = profile?.subscription_tier === 'free' || !profile?.subscription_tier

    return NextResponse.json({
      should_watermark: shouldWatermark,
      tier: profile?.subscription_tier || 'free',
      watermark_text: 'A2Z.co.za'
    })

  } catch (error) {
    console.error('Watermark status error:', error)
    return NextResponse.json(
      { error: 'Failed to get watermark status' },
      { status: 500 }
    )
  }
}
