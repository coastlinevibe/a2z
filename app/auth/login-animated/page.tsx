'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { AnimatedForm, AnimatedInput, AnimatedButton } from '@/components/ui/AnimatedForm'
import { Home, Crown, Users, Check, Star } from 'lucide-react'
import { formatPrice, TIER_PRICING, EARLY_ADOPTER_PRICING } from '@/lib/subscription'

export default function AnimatedLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get selected plan from URL params
  const selectedPlan = searchParams?.get('plan')
  const showPlanInfo = selectedPlan && selectedPlan !== 'free'

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-[url('/images/hero/bg2.jpg')] bg-center bg-no-repeat bg-cover py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/65 to-emerald-950/85 backdrop-blur-[1px] md:backdrop-blur-sm"></div>
      
      {/* Home Link */}
      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-emerald-300 transition-colors">
        <Home className="h-5 w-5" />
        <span className="font-semibold">Home</span>
      </Link>
      
      <div className="relative z-10">
      <AnimatedForm>
        <div className="relative mb-6">
          <h2 className="text-3xl font-bold text-emerald-400 flex items-center">
            <div className="w-4 h-4 bg-emerald-400 rounded-full mr-3 relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            Sign In
          </h2>
          <p className="text-gray-300 text-sm mt-2">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        {/* Plan Selection Info */}
        {showPlanInfo && (
          <div className="mb-6 p-4 rounded-xl border-2 border-yellow-500 bg-yellow-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">
                {selectedPlan === 'premium' ? 'Premium' : 'Business'} Plan Selected
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              Sign in to upgrade to {selectedPlan === 'premium' ? 'Premium' : 'Business'} and unlock all features!
            </p>
            <div className="text-center">
              <Link 
                href="/choose-plan" 
                className="text-yellow-400 hover:text-yellow-300 text-sm underline"
              >
                Change plan selection
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatedInput
            label="Email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />

          <AnimatedInput
            label="Password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            showPasswordToggle={true}
            required
          />

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-2">
              {error}
            </div>
          )}

          <div className="text-right">
            <Link href="/auth/forgot-password" className="text-sm text-emerald-400 hover:underline">
              Forgot your password?
            </Link>
          </div>

          <AnimatedButton type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </AnimatedButton>

          <p className="text-center text-gray-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link href={`/auth/signup-animated${selectedPlan ? `?plan=${selectedPlan}` : ''}`} className="text-emerald-400 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </AnimatedForm>
      </div>
    </div>
  )
}
