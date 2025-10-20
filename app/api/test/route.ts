import { NextRequest, NextResponse } from 'next/server'

// Force Node.js runtime instead of Edge
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test API works!',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'Test POST works!',
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method
  })
}
