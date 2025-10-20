import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')
    const userId = searchParams.get('user_id')
    const days = parseInt(searchParams.get('days') || '30')

    if (!postId && !userId) {
      return NextResponse.json(
        { error: 'post_id or user_id required' },
        { status: 400 }
      )
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get summary stats
    let query = supabase
      .from('analytics_summary')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false })

    if (postId) {
      query = query.eq('post_id', postId)
    }

    const { data: summaryData, error: summaryError } = await query

    if (summaryError) {
      console.error('Summary query error:', summaryError)
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }

    // Calculate totals
    const totals = summaryData?.reduce((acc, day) => ({
      views: acc.views + (day.views || 0),
      unique_views: acc.unique_views + (day.unique_views || 0),
      clicks: acc.clicks + (day.clicks || 0),
      whatsapp_clicks: acc.whatsapp_clicks + (day.whatsapp_clicks || 0),
      phone_clicks: acc.phone_clicks + (day.phone_clicks || 0),
      shares: acc.shares + (day.shares || 0),
    }), {
      views: 0,
      unique_views: 0,
      clicks: 0,
      whatsapp_clicks: 0,
      phone_clicks: 0,
      shares: 0,
    })

    // Get traffic sources
    const { data: sourcesData } = await supabase
      .from('analytics_events')
      .select('utm_source, utm_medium, referrer')
      .eq('post_id', postId)
      .gte('created_at', startDate.toISOString())
      .limit(1000)

    // Aggregate sources
    const sources: Record<string, number> = {}
    sourcesData?.forEach(event => {
      const source = event.utm_source || event.referrer || 'Direct'
      sources[source] = (sources[source] || 0) + 1
    })

    // Get device breakdown
    const { data: devicesData } = await supabase
      .from('analytics_events')
      .select('device_type')
      .eq('post_id', postId)
      .gte('created_at', startDate.toISOString())

    const devices: Record<string, number> = {}
    devicesData?.forEach(event => {
      const device = event.device_type || 'unknown'
      devices[device] = (devices[device] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      totals,
      daily: summaryData,
      sources,
      devices,
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days
      }
    })

  } catch (error) {
    console.error('Analytics stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
