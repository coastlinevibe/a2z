import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generatePayFastData } from '@/lib/payments/payfast'
import { PAYFAST_CONFIG } from '@/lib/payments/config'
import { PRICING } from '@/lib/payments/config'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier, provider = 'ozow' } = body

    // Validate tier
    if (!['premium', 'business'].includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Get user profile to check early adopter status
    const { data: profile } = await supabase
      .from('profiles')
      .select('early_adopter, subscription_tier, display_name')
      .eq('id', user.id)
      .single()

    // Check if already subscribed to this tier
    if (profile?.subscription_tier === tier) {
      return NextResponse.json({ error: 'Already subscribed to this tier' }, { status: 400 })
    }

    // Calculate amount
    const tierPricing = PRICING[tier as keyof typeof PRICING]
    const amount = profile?.early_adopter && 'earlyAdopterPrice' in tierPricing
      ? tierPricing.earlyAdopterPrice
      : tierPricing.price

    // Generate unique transaction reference
    const transactionReference = `A2Z-${Date.now()}-${user.id.slice(0, 8)}`

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount_cents: amount,
        currency: 'ZAR',
        subscription_tier: tier,
        provider: provider,
        transaction_reference: transactionReference,
        status: 'pending',
        metadata: {
          early_adopter: profile?.early_adopter || false,
          original_tier: profile?.subscription_tier || 'free'
        }
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }

    // Generate payment URL/data based on provider
    let paymentUrl: string
    let paymentData: any = null

    if (provider === 'payfast') {
      // Generate PayFast form data
      paymentData = generatePayFastData({
        amount,
        transactionReference,
        customerEmail: user.email!,
        customerName: profile?.display_name || undefined,
        tier
      })
      paymentUrl = `/payment/payfast?ref=${transactionReference}`
    } else if (provider === 'eft') {
      // EFT instructions page
      paymentUrl = `/payment/eft?ref=${transactionReference}`
    } else {
      return NextResponse.json({ error: 'Invalid payment provider' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      paymentUrl,
      paymentData, // Include PayFast form data
      transactionReference,
      amount,
      tier
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
