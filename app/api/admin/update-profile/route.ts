import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, tier, subscription_status, early_adopter, verified_seller } = body

    // Calculate subscription end date for trials (30 days from now)
    const subscriptionEndDate = tier !== 'free' 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null

    // Update profile
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user_id,
        tier: tier || 'free',
        subscription_status: subscription_status || 'active',
        subscription_end_date: subscriptionEndDate,
        early_adopter: early_adopter || false,
        verified_seller: verified_seller || false,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json(
        { error: 'Failed to update profile', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      profile,
      message: `Profile updated to ${tier} tier` 
    })
  } catch (error) {
    console.error('Admin update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
