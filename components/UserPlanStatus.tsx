'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { Crown, Users, Calendar, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface UserProfile {
  tier: 'free' | 'premium' | 'business'
  subscription_status: 'active' | 'inactive' | 'trial' | 'expired'
  subscription_end_date: string | null
  verified_seller: boolean
  early_adopter: boolean
}

export default function UserPlanStatus() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  console.log('UserPlanStatus component rendering, user:', user?.id)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      console.log('Fetching profile for user:', user?.id)
      const { data, error } = await supabase
        .from('profiles')
        .select('tier, subscription_status, subscription_end_date, verified_seller, early_adopter')
        .eq('id', user?.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        // Set default profile for free users if no profile exists
        setProfile({
          tier: 'free',
          subscription_status: 'active',
          subscription_end_date: null,
          verified_seller: false,
          early_adopter: false
        })
        return
      }

      console.log('Profile data:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50">
        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50">
        <span className="text-sm text-gray-500">Free Plan</span>
      </div>
    )
  }

  const getPlanIcon = () => {
    switch (profile.tier) {
      case 'premium':
        return <Crown className="w-4 h-4 text-emerald-500" />
      case 'business':
        return <Users className="w-4 h-4 text-blue-500" />
      default:
        return null
    }
  }

  const getPlanName = () => {
    switch (profile.tier) {
      case 'premium':
        return 'Premium'
      case 'business':
        return 'Business'
      default:
        return 'Free'
    }
  }

  const getPlanColor = () => {
    switch (profile.tier) {
      case 'premium':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'business':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getExpiryInfo = () => {
    if (!profile.subscription_end_date) {
      return profile.tier === 'free' ? 'Forever free' : 'No expiry'
    }

    const endDate = new Date(profile.subscription_end_date)
    const now = new Date()
    
    if (endDate < now) {
      return 'Expired'
    }

    const timeUntilExpiry = formatDistanceToNow(endDate, { addSuffix: true })
    
    if (profile.subscription_status === 'trial') {
      return `Trial ends ${timeUntilExpiry}`
    }
    
    return `Renews ${timeUntilExpiry}`
  }

  const isExpiringSoon = () => {
    if (!profile.subscription_end_date) return false
    
    const endDate = new Date(profile.subscription_end_date)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  return (
    <div className="flex items-center gap-2 ml-4">
      {/* Plan Badge */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getPlanColor()}`}>
        {getPlanIcon()}
        <span>{getPlanName()}</span>
        {profile.verified_seller && (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        )}
      </div>

      {/* Expiry Info - Hidden on small screens */}
      <div className="hidden md:flex items-center gap-1 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        <span className={isExpiringSoon() ? 'text-orange-600 font-medium' : ''}>
          {getExpiryInfo()}
        </span>
      </div>

      {/* Early Adopter Badge */}
      {profile.early_adopter && (
        <div className="hidden lg:block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          Early Adopter
        </div>
      )}
    </div>
  )
}
