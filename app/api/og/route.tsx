import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'A2Z Listing'
    const price = searchParams.get('price') || 'Price on request'
    const username = searchParams.get('username') || 'Seller'

    // Add cache headers to ensure WhatsApp can cache the image
    const response = new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #0f766e 0%, #022c22 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'white',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)',
            }}
          />
          
          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              zIndex: 1,
              padding: '60px',
            }}
          >
            {/* Brand */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: '0.1em',
                marginBottom: 40,
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              A2Z
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: 30,
                maxWidth: '900px',
                textAlign: 'center',
              }}
            >
              {title}
            </div>

            {/* Price */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 600,
                color: '#10b981',
                marginBottom: 40,
                padding: '20px 40px',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: 16,
                border: '2px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {price}
            </div>

            {/* Seller */}
            <div
              style={{
                fontSize: 32,
                color: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <span>by</span>
              <span
                style={{
                  fontWeight: 600,
                  color: '#f1f5f9',
                }}
              >
                @{username}
              </span>
            </div>

            {/* CTA */}
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: 40,
                letterSpacing: '0.05em',
              }}
            >
              Visit a2z.co.za to view listing
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )

    // Add cache headers for WhatsApp and other crawlers
    response.headers.set('Cache-Control', 'public, max-age=86400, immutable')
    response.headers.set('Content-Type', 'image/png')
    
    return response
  } catch (e: any) {
    console.log(`Failed to generate OG image: ${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
