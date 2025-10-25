'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Search, User, Menu, X } from 'lucide-react'
import { isMobile } from '@/lib/mobile/utils'

export function MobileBottomNav() {
  const pathname = usePathname()
  const [show, setShow] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShow(false)
      } else {
        setShow(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/create', icon: PlusCircle, label: 'Create' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  if (!isMobile()) return null

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 transition-transform duration-300 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-emerald-600'
                  : 'text-gray-600 active:text-emerald-600'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  if (!isMobile()) return null

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">A2Z</span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          style={{ top: 'calc(3.5rem + env(safe-area-inset-top))' }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-white h-full w-64 ml-auto p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-2">
              <Link
                href="/pricing"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  const message = encodeURIComponent('Hi! I need support with A2Z Marketplace.')
                  window.open(`https://wa.me/27714329190?text=${message}`, '_blank')
                  setMenuOpen(false)
                }}
                className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Support
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

export function MobileSafeArea({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        paddingTop: 'calc(3.5rem + env(safe-area-inset-top))',
        paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))',
      }}
    >
      {children}
    </div>
  )
}
