'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { AnimatedForm, AnimatedInput, AnimatedButton } from '@/components/ui/AnimatedForm'
import { Home, Crown, Users, Check, Star, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { formatPrice, TIER_PRICING, EARLY_ADOPTER_PRICING } from '@/lib/subscription'

export default function AnimatedSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; title: string; description?: string } | null>(null)
  const { signUp, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get selected plan from URL params
  const selectedPlan = searchParams?.get('plan') || 'free'
  const isEarlyAdopter = true // For first 500 users

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  useEffect(() => {
    if (!notification) return

    const timeout = setTimeout(() => {
      setNotification(null)
    }, notification.type === 'success' ? 8000 : 6000)

    return () => clearTimeout(timeout)
  }, [notification])

  // Plan configuration
  const getPlanConfig = (plan: string) => {
    switch (plan) {
      case 'premium':
        return {
          name: 'Premium',
          icon: Crown,
          color: 'emerald',
          price: isEarlyAdopter ? EARLY_ADOPTER_PRICING.premium.monthly : TIER_PRICING.premium.monthly,
          originalPrice: TIER_PRICING.premium.monthly,
          features: ['Unlimited listings', '8 images + videos', 'Verified badge ✓', '35-day duration'],
          discount: isEarlyAdopter ? '41% off' : null
        }
      case 'business':
        return {
          name: 'Business',
          icon: Users,
          color: 'blue',
          price: isEarlyAdopter ? EARLY_ADOPTER_PRICING.business.monthly : TIER_PRICING.business.monthly,
          originalPrice: TIER_PRICING.business.monthly,
          features: ['Everything in Premium', '20 images + videos', 'Custom branding', 'Team collaboration'],
          discount: isEarlyAdopter ? '45% off' : null
        }
      default:
        return {
          name: 'Free',
          icon: Check,
          color: 'gray',
          price: 0,
          originalPrice: 0,
          features: ['3 active listings', '5 images per listing', '7-day duration', 'Basic features'],
          discount: null
        }
    }
  }

  const planConfig = getPlanConfig(selectedPlan)

  const NotificationAlert = () => {
    if (!notification) return null

    const base = 'mb-6 rounded-xl px-4 py-3 border text-left'
    const variants = {
      success: 'bg-emerald-500/10 border-emerald-400 text-emerald-100',
      error: 'bg-red-500/10 border-red-500 text-red-100',
      info: 'bg-blue-500/10 border-blue-400 text-blue-100',
    } as const

    const Icon = notification.type === 'success' ? CheckCircle2 : notification.type === 'error' ? AlertTriangle : Info

    return (
      <div className={`${base} ${variants[notification.type]}`} role={notification.type === 'error' ? 'alert' : 'status'}>
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-semibold leading-tight">{notification.title}</p>
            {notification.description && (
              <p className="text-sm mt-1 opacity-90 leading-snug">{notification.description}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setNotification(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setNotification({
        type: 'error',
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
      })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setNotification({
        type: 'error',
        title: 'Passwords do not match',
        description: 'Make sure your password and confirmation are identical.',
      })
      setLoading(false)
      return
    }

    setNotification({
      type: 'info',
      title: 'Submitting registration…',
      description: 'Hang tight while we create your account.',
    })

    const fullName = `${name.trim()} ${surname.trim()}`.trim()
    const { error } = await signUp(email, password, { 
      full_name: fullName,
      selected_plan: selectedPlan
    })
    
    if (error) {
      setError(error.message)
      setNotification({
        type: 'error',
        title: 'Registration failed',
        description: error.message,
      })
    } else {
      setSuccess(true)
      setNotification({
        type: 'success',
        title: 'Registration done!',
        description: `Email confirmation link sent to ${email}. Please verify to finish setting up your account.`,
      })
    }
    
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-[url('/images/hero/bg2.jpg')] bg-center bg-no-repeat bg-cover py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/85 via-emerald-950/65 to-emerald-950/85 backdrop-blur-[1px] md:backdrop-blur-sm"></div>
        
        {/* Home Link */}
        <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white hover:text-emerald-300 transition-colors">
          <Home className="h-5 w-5" />
          <span className="font-semibold">Home</span>
        </Link>
        
        <div className="relative z-10">
        <AnimatedForm className="text-center">
          <NotificationAlert />
          <div className="relative">
            <h2 className="text-3xl font-bold text-emerald-400 mb-2 flex items-center justify-center">
              <div className="w-4 h-4 bg-emerald-400 rounded-full mr-3 relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping"></div>
              </div>
              Check your email
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              We&apos;ve sent you a confirmation link at <strong className="text-white">{email}</strong>
            </p>
            <p className="text-gray-400 text-sm">
              Already confirmed?{' '}
              <Link href="/auth/login-animated" className="text-emerald-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </AnimatedForm>
        </div>
      </div>
    )
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
        <NotificationAlert />
        <div className="relative mb-6">
          <h2 className="text-3xl font-bold text-emerald-400 flex items-center">
            <div className="w-4 h-4 bg-emerald-400 rounded-full mr-3 relative">
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            Register
          </h2>
          <p className="text-gray-300 text-sm mt-2">
            Signup now and get full access to our app.
          </p>
        </div>

        {/* Plan Confirmation */}
        <div className={`mb-6 p-4 rounded-xl border-2 ${
          planConfig.color === 'emerald' ? 'border-emerald-500 bg-emerald-500/10' :
          planConfig.color === 'blue' ? 'border-blue-500 bg-blue-500/10' :
          'border-gray-500 bg-gray-500/10'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <planConfig.icon className={`w-5 h-5 ${
                planConfig.color === 'emerald' ? 'text-emerald-400' :
                planConfig.color === 'blue' ? 'text-blue-400' :
                'text-gray-400'
              }`} />
              <span className="text-white font-semibold">
                Registering for {planConfig.name} Plan
              </span>
            </div>
            {planConfig.price > 0 && (
              <div className="text-right">
                <div className="text-white font-bold">
                  {formatPrice(planConfig.price)}/month
                </div>
                {planConfig.discount && (
                  <div className={`text-xs ${
                    planConfig.color === 'emerald' ? 'text-emerald-400' :
                    planConfig.color === 'blue' ? 'text-blue-400' :
                    'text-gray-400'
                  }`}>
                    {planConfig.discount} for 12 months • Then {formatPrice(planConfig.originalPrice)}/month
                  </div>
                )}
              </div>
            )}
            {planConfig.price === 0 && (
              <div className="text-emerald-400 font-bold">FREE</div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            {planConfig.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-300">
                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {isEarlyAdopter && planConfig.price > 0 && (
            <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm">
              <Star className="w-4 h-4" />
              <span>Early Adopter: {planConfig.discount} for first 12 months!</span>
            </div>
          )}

          <div className="mt-3 text-center">
            <Link 
              href="/choose-plan" 
              className="text-emerald-400 hover:text-emerald-300 text-sm underline"
            >
              Want to change your plan?
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <AnimatedInput
              label="Name"
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
            />
            <AnimatedInput
              label="Surname"
              type="text"
              value={surname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)}
              required
            />
          </div>

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

          <AnimatedInput
            label="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            showPasswordToggle={true}
            required
          />

          {error && !notification && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-2">
              {error}
            </div>
          )}

          <AnimatedButton type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Submit'}
          </AnimatedButton>

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href={`/auth/login-animated${selectedPlan ? `?plan=${selectedPlan}` : ''}`} className="text-emerald-400 hover:underline">
              Signin
            </Link>
          </p>
        </form>
      </AnimatedForm>
      </div>
    </div>
  )
}
