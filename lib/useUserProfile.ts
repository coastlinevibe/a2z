import { useState, useEffect } from 'react'
import { useAuth } from './auth'
import { supabase } from './supabaseClient'

interface UserProfile {
  id: string
  full_name: string
  subscription_tier: 'free' | 'premium' | 'business'
  subscription_status: 'active' | 'pending' | 'cancelled' | 'expired'
  subscription_start_date: string
  subscription_end_date?: string
  verified_seller: boolean
  early_adopter: boolean
  created_at: string
}

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNextBillingDate = () => {
    if (!profile || profile.subscription_tier === 'free') return null
    
    if (profile.subscription_end_date) {
      return new Date(profile.subscription_end_date)
    }
    
    // Calculate next billing date (30 days from start)
    const startDate = new Date(profile.subscription_start_date)
    const nextBilling = new Date(startDate)
    nextBilling.setDate(nextBilling.getDate() + 30)
    
    return nextBilling
  }

  const getPlanDisplayName = () => {
    if (!profile) return 'Free'
    
    const tierNames = {
      free: 'Free',
      premium: 'Premium',
      business: 'Business'
    }
    
    return tierNames[profile.subscription_tier] || 'Free'
  }

  return {
    profile,
    loading,
    fetchProfile,
    getNextBillingDate,
    getPlanDisplayName
  }
}
