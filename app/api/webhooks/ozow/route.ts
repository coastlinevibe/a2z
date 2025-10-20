import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyOzowWebhook, parseOzowStatus } from '@/lib/payments/ozow'

// Use service role for webhook (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify webhook signature
    const hashCheck = body.HashCheck
    if (!verifyOzowWebhook(body, hashCheck)) {
      console.error('Invalid Ozow webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const {
      TransactionReference,
      TransactionId,
      Amount,
      Status,
      StatusMessage
    } = body

    // Parse status
    const paymentStatus = parseOzowStatus(Status)

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        provider_transaction_id: TransactionId,
        status_message: StatusMessage,
        updated_at: new Date().toISOString(),
        completed_at: paymentStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('transaction_reference', TransactionReference)
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
