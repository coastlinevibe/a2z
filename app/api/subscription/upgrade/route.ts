import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { subscriptionTierSchema } from '@/lib/validators'
import { TIER_PRICING, EARLY_ADOPTER_PRICING } from '@/lib/subscription'

// Create a server-side Supabase client
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()
    
    // Validate input
    const validationResult = subscriptionTierSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { tier, billing_cycle = 'monthly', early_adopter = false } = validationResult.data

    // Get user from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    // Create client-side supabase instance to verify user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Get current user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier, early_adopter')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if user is trying to downgrade
    const tierOrder = { free: 0, premium: 1, business: 2 }
    if (tierOrder[tier] <= tierOrder[profile.subscription_tier as keyof typeof tierOrder]) {
      return NextResponse.json(
        { error: 'Cannot downgrade or stay on same tier' },
        { status: 400 }
      )
    }

    // Calculate pricing
    let price: number
    if (early_adopter && billing_cycle === 'monthly' && tier in EARLY_ADOPTER_PRICING) {
      price = EARLY_ADOPTER_PRICING[tier as keyof typeof EARLY_ADOPTER_PRICING].monthly
    } else {
      price = TIER_PRICING[tier][billing_cycle]
    }

    // Calculate subscription dates
    const startDate = new Date()
    let endDate = new Date()
    
    switch (billing_cycle) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1)
        break
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3)
        break
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1)
        break
    }

    // For now, we'll simulate payment success
    // In production, you would integrate with PayFast or other SA payment providers
    const paymentSuccessful = true // This would come from your payment provider

    if (!paymentSuccessful) {
      return NextResponse.json(
        { error: 'Payment failed' },
        { status: 402 }
      )
    }

    // Update user subscription
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        verified_seller: true, // Premium+ users get verified badge
        early_adopter: early_adopter || profile.early_adopter
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Subscription update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    // Return success with subscription details
    return NextResponse.json({
      ok: true,
      data: {
        tier,
        billing_cycle,
        price,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        early_adopter: early_adopter || profile.early_adopter
      }
    })

  } catch (error) {
    console.error('Subscription upgrade API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get subscription status
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    // Get user from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      )
    }

    // Create client-side supabase instance to verify user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Get user subscription details
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        subscription_tier,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        trial_end_date,
        verified_seller,
        early_adopter
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get tier limits
    const { data: limits, error: limitsError } = await supabaseAdmin.rpc('check_user_tier_limits', {
      user_id: user.id
    })

    if (limitsError) {
      console.error('Error fetching tier limits:', limitsError)
    }

    return NextResponse.json({
      ok: true,
      data: {
        subscription: profile,
        limits: limits || null
      }
    })

  } catch (error) {
    console.error('Subscription status API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
