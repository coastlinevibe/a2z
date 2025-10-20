import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for analytics insertion
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      event_type,
      post_id,
      user_id,
      session_id,
      visitor_id,
      referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      device_type,
      browser,
      os,
      user_agent,
      metadata
    } = body

    // Validate required fields
    if (!event_type || !post_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get IP address
    const ip_address = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'

    // Insert analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        post_id,
        user_id: user_id || null,
        session_id,
        visitor_id,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        device_type,
        browser,
        os,
        user_agent,
        ip_address: ip_address.split(',')[0].trim(), // First IP if multiple
        metadata: metadata || {}
      })

    if (error) {
      console.error('Analytics insert error:', error)
      // Don't fail the request - analytics should be non-blocking
    }

    // Also update the posts table counters for quick access
    if (event_type === 'view') {
      await supabase.rpc('increment_post_views', { post_id_param: post_id })
    } else if (event_type === 'click' || event_type === 'whatsapp_click' || event_type === 'phone_click') {
      await supabase.rpc('increment_post_clicks', { post_id_param: post_id })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    // Return success anyway - don't break user experience
    return NextResponse.json({ success: true })
  }
}

// Create RPC functions for incrementing counters
// These should be created in a migration:
/*
CREATE OR REPLACE FUNCTION increment_post_views(post_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET views = views + 1 
  WHERE id = post_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_post_clicks(post_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET clicks = clicks + 1 
  WHERE id = post_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
