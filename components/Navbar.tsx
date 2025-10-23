'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, LayoutDashboard, Home, User, LogOut, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { UserProfileDropdown } from '@/components/UserProfileDropdown'
import UserPlanStatus from '@/components/UserPlanStatus'

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()

  const showEarlyAdopterBanner = pathname === '/'

  const handleSignOut = async () => {
    await signOut()
  }

  // Only show protected routes if user is authenticated
  const navItems = [
    ...(user ? [
      {
        href: '/create',
        label: 'Create',
        icon: Plus,
        active: pathname === '/create',
      },
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        active: pathname === '/dashboard',
      },
    ] : []),
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo and Plan Status */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">a2z</span>
            </Link>
            
            {/* User Plan Status */}
            {user && <UserPlanStatus />}
          </div>

          {/* Early Adopter Banner */}
          {showEarlyAdopterBanner && (
            <div className="hidden md:flex flex-1 justify-center">
              <div className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 text-white shadow-md">
                <Star className="w-4 h-4" fill="white" />
                <span className="font-semibold text-xs md:text-sm text-center">
                  Early Adopter: 45% off the first 500 Premium accounts • Then just R49/month regular price.
                </span>
                <Link
                  href="/auth/signup-animated?plan=free"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow hover:shadow-lg"
                >
                  Try Free Plan Now!
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
                </Link>
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4 flex-shrink-0 ml-auto">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      item.active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
            
            {/* Auth Section */}
            {!loading && (
              <div className="flex items-center space-x-2">
                {user ? (
                  <UserProfileDropdown />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/login-animated">
                      <Button size="sm">
                        Log in
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Auth/CTA */}
          <div className="sm:hidden ml-auto">
            {!loading && (
              <>
                {user ? (
                  <UserProfileDropdown />
                ) : (
                  <Link href="/auth/login-animated">
                    <Button size="sm">
                      Log in
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Early Adopter Banner */}
      {showEarlyAdopterBanner && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3">
            <div className="flex flex-col items-center gap-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-3 text-white shadow">
              <div className="flex items-center gap-2 text-sm font-semibold text-center">
                <Star className="w-4 h-4" fill="white" />
                <span>Early Adopter: 45% off the first 500 Premium accounts • Then just R49/month regular price.</span>
              </div>
              <Link
                href="/auth/signup-animated?plan=free"
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 text-sm font-semibold transition-colors shadow hover:shadow-lg"
              >
                Try Free Plan Now!
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors',
                  item.active
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
