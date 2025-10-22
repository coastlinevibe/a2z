'use client'

import Link from 'next/link'
import { ArrowRight, Smartphone, Share2, MessageCircle, Zap, Shield, Globe, Star, Crown, Users, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { MovingBorderButton } from '@/components/ui/moving-border'

export default function HomePage() {
  const { user, loading } = useAuth()
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black bg-[url('/images/hero/bg2.jpg')] bg-center bg-no-repeat bg-[length:65%] sm:bg-[length:75%] md:bg-[length:85%] lg:bg-[length:95%] xl:bg-cover pt-[82px] pb-28 md:pt-[98px] md:pb-32 lg:pt-[130px] lg:pb-40">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/65 to-emerald-950/85 backdrop-blur-[1px] md:backdrop-blur-sm"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Early Adopter Banner */}
            <div className="flex justify-center mb-12 -translate-y-6 sm:-translate-y-8">
              <MovingBorderButton
                borderRadius="1rem"
                duration={4000}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4"
                containerClassName="inline-block"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6" fill="white" />
                  <span className="font-bold text-lg">Early Adopter: 45% off the first 500 Premium accounts • Then just R49/month regular price.</span>
                  <Link href="/auth/signup-animated?plan=free">
                    <button className="ml-2 inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 text-base font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 border-2 border-emerald-400">
                      Try Free Plan Now!
                      <ArrowRight className="h-5 w-5" strokeWidth={3} />
                    </button>
                  </Link>
                </div>
              </MovingBorderButton>
            </div>
            
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
                <p className="text-xl text-emerald-50 mb-6 max-w-3xl mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                  Turn your photos into sales in minutes. Create beautiful listings and share them instantly on WhatsApp, Facebook, Instagram, and more.
                </p>
                <div className="text-emerald-200 mb-8 max-w-2xl mx-auto">
                  <div className="flex flex-wrap justify-center gap-6 text-sm">
                    <span>✓ Start Free Forever</span>
                    <span>✓ No Transaction Fees</span>
                    <span>✓ WhatsApp Native</span>
                    <span>✓ Built for SA Sellers</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/signup-animated?plan=free"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center justify-center shadow-lg"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-8 rounded-xl border border-gray-300 transition-colors"
                  >
                    View Pricing
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

      {/* Pricing Preview */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple Pricing for Every Seller
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Start free, upgrade when you're ready. No hidden fees, no commissions.
            </p>
            {/* Early Adopter Badge */}
            <div className="flex justify-center">
              <MovingBorderButton
                borderRadius="0.75rem"
                duration={4000}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3"
                containerClassName="inline-block"
              >
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5" fill="white" />
                  <span className="font-bold text-base">Early Adopter: 45% off the first 500 Premium accounts • Then just R49/month regular price.</span>
                  <Link href="/auth/signup-animated?plan=free">
                    <button className="ml-2 inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-400">
                      Try Free Plan Now!
                      <ArrowRight className="h-4 w-4" strokeWidth={3} />
                    </button>
                  </Link>
                </div>
              </MovingBorderButton>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-3xl font-bold text-gray-900 mb-4">R0</div>
              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>3 active listings</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>5 images per listing</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>7-day duration</span>
                </div>
              </div>
              <Link
                href="/auth/signup-animated?plan=free"
                className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors inline-block"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Tier */}
            <div className="bg-white rounded-2xl border-2 border-emerald-500 p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Most Popular
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-emerald-500" />
                <h3 className="text-xl font-bold text-gray-900">Premium</h3>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-gray-900">R29</div>
                <div className="text-sm text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-full shadow-[0_0_18px_rgba(16,185,129,0.25)]">
                  45% off the first 500 Premium accounts • Then just R49/month regular price
                </div>
              </div>
              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Unlimited listings</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>8 images + videos</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Verified badge ✓</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>35-day duration</span>
                </div>
              </div>
              <Link
                href="/auth/signup-animated?plan=premium"
                className="w-full py-2 px-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors inline-block"
              >
                Start Premium
              </Link>
            </div>

            {/* Business Tier */}
            <div className="bg-white rounded-2xl border-2 border-blue-500 p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
                <h3 className="text-xl font-bold text-gray-900">Business</h3>
              </div>
              <div className="mb-2">
                <div className="text-3xl font-bold text-gray-900">R99</div>
                <div className="text-sm text-blue-600 font-medium">45% off for 12 months • Then R179/month</div>
              </div>
              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>Everything in Premium</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>20 images + videos</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>Custom branding</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-500" />
                  <span>Team collaboration</span>
                </div>
              </div>
              <Link
                href="/auth/signup-animated?plan=business"
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-block"
              >
                Start Business
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/choose-plan"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Full plan pricing details →
            </Link>
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
                Start Free
              </h3>
              <p className="text-gray-600">
                Begin with 3 free listings forever. Upgrade when you're ready to grow. No transaction fees ever.
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
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <MovingBorderButton
              borderRadius="0.75rem"
              duration={3000}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3"
              containerClassName="inline-block"
            >
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5" fill="white" />
                <span className="font-bold text-base">Early Adopter: 45% off the first 500 Premium accounts • Then just R49/month regular price.</span>
                <Link href="/auth/signup-animated?plan=free">
                  <button className="ml-2 inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-400">
                    Try Free Plan Now!
                    <ArrowRight className="h-4 w-4" strokeWidth={3} />
                  </button>
                </Link>
              </div>
            </MovingBorderButton>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Selling Smarter?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join the A2Z revolution. Start free, grow with confidence, and keep 100% of your profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup-animated?plan=free"
              className="bg-white hover:bg-gray-100 text-emerald-600 font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 font-semibold py-4 px-8 rounded-xl transition-colors inline-flex items-center justify-center"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold">A2Z</span>
            </div>
            <p className="text-gray-400 mb-4">
              Everything A to Z. No Store Needed.
            </p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Link href="/help" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
                Help
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/pricing" className="text-sm text-gray-400 hover:text-gray-300 transition-colors">
                Pricing
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
                Admin
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 a2z. Made with ❤️ for South African sellers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
