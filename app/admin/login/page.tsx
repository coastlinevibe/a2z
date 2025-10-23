'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'

export default function AdminLoginPage() {
  const { user, signIn, signOut, loading } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const verifyAdmin = useCallback(async (userId: string) => {
    try {
      setVerifying(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()

      if (error || !data?.is_admin) {
        await signOut()
        setError('Access denied. Admin credentials required.')
        setVerifying(false)
        return
      }

      router.push('/admin')
    } catch (err) {
      console.error('Admin verification failed:', err)
      await signOut()
      setError('Unable to verify admin status. Please try again.')
      setVerifying(false)
    }
  }, [router, signOut])

  useEffect(() => {
    if (user) {
      verifyAdmin(user.id)
    }
  }, [user, verifyAdmin])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setFormLoading(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message)
      setFormLoading(false)
      return
    }

    // wait for useEffect to verify admin after auth state updates
    setFormLoading(false)
  }

  const isBusy = formLoading || verifying || loading

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-950 to-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl border border-emerald-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
              <p className="text-sm text-gray-500">Restricted area. Authorized personnel only.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                placeholder="admin@a2z.co.za"
                disabled={isBusy}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                placeholder="Enter your password"
                disabled={isBusy}
              />
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-emerald-400 disabled:shadow-none"
            >
              {isBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying access...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in as Admin
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Need to go back?{' '}
              <Link href="/" className="font-semibold text-emerald-600 hover:text-emerald-500">
                Return to site
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
