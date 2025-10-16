'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { AnimatedForm, AnimatedInput, AnimatedButton } from '@/components/ui/AnimatedForm'

export default function AnimatedLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, user } = useAuth()
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

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <AnimatedForm>
        <div className="relative mb-6">
          <h2 className="text-3xl font-bold text-blue-400 flex items-center">
            <div className="w-4 h-4 bg-blue-400 rounded-full mr-3 relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
            </div>
            Sign In
          </h2>
          <p className="text-gray-300 text-sm mt-2">
            Welcome back! Please sign in to your account.
          </p>
        </div>

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
            <Link href="/auth/forgot-password" className="text-sm text-blue-400 hover:underline">
              Forgot your password?
            </Link>
          </div>

          <AnimatedButton type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </AnimatedButton>

          <p className="text-center text-gray-400 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup-animated" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </AnimatedForm>
    </div>
  )
}
