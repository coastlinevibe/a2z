import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyPayFastSignature, verifyPayFastIP, parsePayFastStatus } from '@/lib/payments/payfast'

// Use service role for webhook (bypasses RLS)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.text()
    const params = new URLSearchParams(body)
    const data: any = {}
    
    // Convert URLSearchParams to object
    params.forEach((value, key) => {
      data[key] = value
    })

    // Verify IP address
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || ''
    if (!verifyPayFastIP(ip.split(',')[0].trim())) {
      console.error('Invalid PayFast IP:', ip)
      return NextResponse.json({ error: 'Invalid IP' }, { status: 401 })
    }

    // Verify signature
    const signature = data.signature
    if (!verifyPayFastSignature(data, signature)) {
      console.error('Invalid PayFast signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const {
      m_payment_id: transactionReference,
      pf_payment_id: paymentId,
      payment_status: status,
      amount_gross: amount,
      custom_str1: tier,
    } = data

    // Parse status
    const paymentStatus = parsePayFastStatus(status)

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        provider_transaction_id: paymentId,
        status_message: status,
        updated_at: new Date().toISOString(),
        completed_at: paymentStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('transaction_reference', transactionReference)
      .select()
      .single()

    if (paymentError) {
      console.error('Payment update error:', paymentError)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // If payment completed, upgrade user subscription
    if (paymentStatus === 'completed') {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: payment.subscription_tier,
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.user_id)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
