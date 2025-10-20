'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { BadgeCheck, X, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  display_name: string | null
  username: string | null
  email: string
  subscription_tier: 'free' | 'premium' | 'business'
  verified_seller: boolean
  created_at: string
}

export default function VerifiedSellersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    checkAdminAccess()
  }, [user])

  const checkAdminAccess = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      if (profile?.is_admin) {
        setIsAdmin(true)
        fetchProfiles()
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    }
  }

  const fetchProfiles = async () => {
    try {
      // Get all profiles with their auth data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Get auth users to get emails
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

      if (usersError) throw usersError

      // Merge profile data with email from auth
      const mergedData = profilesData.map(profile => {
        const authUser = users.find(u => u.id === profile.id)
        return {
          ...profile,
          email: authUser?.email || 'No email'
        }
      })

      setProfiles(mergedData)
    } catch (error) {
      console.error('Error fetching profiles:', error)
      setMessage({ type: 'error', text: 'Failed to load profiles' })
    } finally {
      setLoading(false)
    }
  }

  const toggleVerifiedStatus = async (profileId: string, currentStatus: boolean) => {
    setUpdating(profileId)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified_seller: !currentStatus })
        .eq('id', profileId)

      if (error) throw error

      setMessage({ 
        type: 'success', 
        text: `Verified status ${!currentStatus ? 'granted' : 'revoked'} successfully` 
      })
      fetchProfiles()
    } catch (error: any) {
      console.error('Error updating verified status:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update status' })
    } finally {
      setUpdating(null)
    }
  }

  const filteredProfiles = profiles.filter(profile => {
    const query = searchQuery.toLowerCase()
    return (
      profile.display_name?.toLowerCase().includes(query) ||
      profile.username?.toLowerCase().includes(query) ||
      profile.email.toLowerCase().includes(query)
    )
  })

  const getTierBadge = (tier: string) => {
    const badges = {
      free: { text: 'Free', className: 'bg-gray-100 text-gray-700' },
      premium: { text: 'Premium', className: 'bg-emerald-100 text-emerald-700' },
      business: { text: 'Business', className: 'bg-blue-100 text-blue-700' }
    }
    return badges[tier as keyof typeof badges] || badges.free
  }

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">
          {loading ? 'Loading...' : 'Access Denied'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Verified Sellers</h1>
              <p className="text-gray-600">Manage verified seller badges for users</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700">
              {profiles.filter(p => p.verified_seller).length} Verified
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username, or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Profiles Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No profiles found
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((profile) => {
                    const tierBadge = getTierBadge(profile.subscription_tier)
                    return (
                      <tr key={profile.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-semibold text-emerald-700">
                              {profile.display_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {profile.display_name || 'No name'}
                              </div>
                              <div className="text-sm text-gray-500">
                                @{profile.username || 'no-username'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {profile.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={tierBadge.className}>
                            {tierBadge.text}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {profile.verified_seller ? (
                            <div className="flex items-center gap-2 text-blue-600">
                              <BadgeCheck className="w-5 h-5" />
                              <span className="text-sm font-medium">Verified</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not verified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button
                            onClick={() => toggleVerifiedStatus(profile.id, profile.verified_seller)}
                            disabled={updating === profile.id}
                            size="sm"
                            className={profile.verified_seller 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }
                          >
                            {updating === profile.id ? (
                              'Updating...'
                            ) : profile.verified_seller ? (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Revoke
                              </>
                            ) : (
                              <>
                                <BadgeCheck className="w-4 h-4 mr-1" />
                                Verify
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">About Verified Seller Badges</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Verified badges appear next to listing titles</li>
            <li>• Helps build trust with potential buyers</li>
            <li>• Typically granted to Premium/Business users with good reputation</li>
            <li>• Can be revoked if user violates terms of service</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
