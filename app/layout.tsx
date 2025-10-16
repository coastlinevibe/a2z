import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'A2Z - Everything A to Z. No Store Needed.',
  description: 'Turn your photo into a sale. Create beautiful listings and share them instantly on WhatsApp.',
  keywords: 'sell, whatsapp, marketplace, south africa, online selling',
  authors: [{ name: 'A2Z' }],
  creator: 'A2Z',
  publisher: 'A2Z',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
