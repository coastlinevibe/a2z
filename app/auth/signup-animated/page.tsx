'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { AnimatedForm, AnimatedInput, AnimatedButton } from '@/components/ui/AnimatedForm'
import { Home } from 'lucide-react'

export default function AnimatedSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const fullName = `${name.trim()} ${surname.trim()}`.trim()
    const { error } = await signUp(email, password, { full_name: fullName })
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
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

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800 rounded-lg p-2">
              {error}
            </div>
          )}

          <AnimatedButton type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Submit'}
          </AnimatedButton>

          <p className="text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/auth/login-animated" className="text-emerald-400 hover:underline">
              Signin
            </Link>
          </p>
        </form>
      </AnimatedForm>
      </div>
    </div>
  )
}
