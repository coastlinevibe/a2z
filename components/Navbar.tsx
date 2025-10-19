'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, LayoutDashboard, Home, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import UserPlanStatus from '@/components/UserPlanStatus'

export function Navbar() {
  const pathname = usePathname()
  const { user, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  // Only show protected routes if user is authenticated
  const navItems = [
    // Only show Home link if not on home page
    ...(pathname !== '/' ? [{
      href: '/',
      label: 'Home',
      icon: Home,
      active: pathname === '/',
    }] : []),
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
        <div className="flex justify-between items-center h-16">
          {/* Logo and Plan Status */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">a2z</span>
            </Link>
            
            {/* User Plan Status */}
            {user && <UserPlanStatus />}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4">
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
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <Button
                      onClick={handleSignOut}
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/login-animated">
                      <Button variant="ghost" size="sm">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/auth/signup-animated?plan=free">
                      <Button size="sm">
                        Get Started Free
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Auth/CTA */}
          <div className="sm:hidden">
            {!loading && (
              <>
                {user ? (
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                ) : (
                  <Link href="/auth/signup-animated?plan=free">
                    <Button size="sm">
                      Get Started Free
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>

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
