import { NextRequest, NextResponse } from 'next/server'
import { batchResetFreeAccounts } from '@/lib/freeAccountReset'

/**
 * Daily cron job to reset free accounts that have reached their 7-day cycle
 * This endpoint should be called once daily by a cron service (e.g., Vercel Cron, GitHub Actions)
 * 
 * Expected to run at midnight UTC daily
 */
export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error('CRON_SECRET environment variable not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting daily free account reset job...')
    
    const result = await batchResetFreeAccounts()
    
    console.log(`Free account reset job completed: ${result.success} successful, ${result.failed} failed`)
    
    return NextResponse.json({
      success: true,
      message: 'Free account reset job completed',
      results: result
    })
    
  } catch (error) {
    console.error('Error in free account reset cron job:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET endpoint for manual testing (remove in production)
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }
  
  try {
    console.log('Manual free account reset job triggered...')
    
    const result = await batchResetFreeAccounts()
    
    return NextResponse.json({
      success: true,
      message: 'Manual free account reset completed',
      results: result
    })
    
  } catch (error) {
    console.error('Error in manual free account reset:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
