'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { ArrowLeft, Gift, Users, Copy, Check, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ReferralsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    // Generate referral code from user ID
    setReferralCode(user.id.slice(0, 8).toUpperCase())
  }, [user])

  const referralUrl = `https://a2z.co.za/signup?ref=${referralCode}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-8 text-white mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Refer & Earn</h1>
          </div>
          <p className="text-emerald-50 text-lg mb-6">
            Share A2Z with your friends and earn rewards when they sign up!
          </p>
          
          {/* Referral Link */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <label className="text-sm font-medium text-emerald-50 mb-2 block">
              Your Referral Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button
                onClick={copyToClipboard}
                className="bg-white text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Total Referrals</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">Active Referrals</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">R0</p>
                <p className="text-sm text-gray-500">Rewards Earned</p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">How It Works</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-emerald-600">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Share Your Link</h3>
                <p className="text-sm text-gray-600">
                  Copy your unique referral link and share it with friends, family, or on social media.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-emerald-600">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">They Sign Up</h3>
                <p className="text-sm text-gray-600">
                  When someone signs up using your link, they'll be tracked as your referral.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-emerald-600">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Earn Rewards</h3>
                <p className="text-sm text-gray-600">
                  Get rewards when your referrals upgrade to Premium or Business plans!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Referral Rewards</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Premium Referral</h3>
                <p className="text-sm text-gray-600">When your referral upgrades to Premium</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">R10</p>
                <p className="text-xs text-gray-500">per referral</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Business Referral</h3>
                <p className="text-sm text-gray-600">When your referral upgrades to Business</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">R25</p>
                <p className="text-xs text-gray-500">per referral</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Referral rewards are currently in beta. Rewards will be credited to your account once the program officially launches.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
