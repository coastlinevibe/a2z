'use client'

import Link from 'next/link'
import { ArrowRight, Smartphone, Share2, MessageCircle, Zap, Shield, Globe } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function HomePage() {
  const { user, loading } = useAuth()
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black bg-[url('/images/hero/bg2.jpg')] bg-center bg-no-repeat bg-[length:65%] sm:bg-[length:75%] md:bg-[length:85%] lg:bg-[length:95%] xl:bg-cover py-28 md:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/65 to-emerald-950/85 backdrop-blur-[1px] md:backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {user ? (
              <>
                <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                  Welcome back,
                  <br />
                  <span className="text-emerald-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">{user.user_metadata?.full_name || user.email?.split('@')[0]}!</span>
                </h1>
                <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                  Ready to create your next listing? Your dashboard is waiting.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/create"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center justify-center"
                  >
                    Create New Listing
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-8 rounded-xl border border-gray-300 transition-colors"
                  >
                    View Dashboard
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                  Everything A to Z.<br />
                  <span className="text-emerald-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">No Store Needed.</span>
                </h1>
                <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                  Turn your photo into a sale. Create beautiful listings and share them instantly across all platforms.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/signup-animated"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center justify-center"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/auth/login-animated"
                    className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-8 rounded-xl border border-gray-300 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get selling in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Smartphone className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                1. Upload & Describe
              </h3>
              <p className="text-gray-600">
                Add photos, set your price, write a description, and pick emoji tags that match your item.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Share2 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                2. Get Your Link
              </h3>
              <p className="text-gray-600">
                Instantly get a beautiful, shareable link that works perfectly across WhatsApp, SMS, email, and social media.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                3. Start Selling
              </h3>
              <p className="text-gray-600">
                Share anywhere—WhatsApp, Facebook, Instagram, SMS—and close deals faster than ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose a2z?
            </h2>
            <p className="text-lg text-gray-600">
              Built for the way South Africans actually sell
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Zap className="h-8 w-8 text-emerald-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Create a listing in under 2 minutes. No complex setup, no monthly fees.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <MessageCircle className="h-8 w-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Share Everywhere
              </h3>
              <p className="text-gray-600">
                Designed for all platforms with beautiful previews and direct contact buttons that work everywhere.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Shield className="h-8 w-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Always Free
              </h3>
              <p className="text-gray-600">
                No hidden costs, no transaction fees. Just simple, honest selling tools.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Globe className="h-8 w-8 text-orange-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Local Focus
              </h3>
              <p className="text-gray-600">
                Built for South African sellers with ZAR pricing and local best practices.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Smartphone className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mobile First
              </h3>
              <p className="text-gray-600">
                Perfect on mobile devices where most of your selling actually happens.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Share2 className="h-8 w-8 text-red-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Sharing
              </h3>
              <p className="text-gray-600">
                One-click sharing to any platform with pre-written messages that convert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of South Africans who are already selling smarter with a2z.
          </p>
          <Link
            href="/create"
            className="bg-white hover:bg-gray-100 text-emerald-600 font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center"
          >
            Create Your First Listing
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold">a2z</span>
            </div>
            <p className="text-gray-400 mb-4">
              Everything A to Z. No Store Needed.
            </p>
            <p className="text-sm text-gray-500">
              © 2024 a2z. Made with ❤️ for South African sellers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
