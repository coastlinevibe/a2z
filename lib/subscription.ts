import { supabase } from './supabaseClient'

export interface TierLimits {
  tier: 'free' | 'premium' | 'business'
  max_listings: number // -1 for unlimited
  max_images: number
  max_videos: number
  listing_duration_days: number
  current_listings: number
  can_create_listing: boolean
  verified_badge: boolean
  watermark_removed: boolean
  gallery_types: string[]
}

export interface UserSubscription {
  subscription_tier: 'free' | 'premium' | 'business'
  subscription_status: 'active' | 'cancelled' | 'expired' | 'trial'
  subscription_start_date?: string
  subscription_end_date?: string
  trial_end_date?: string
  verified_seller: boolean
  early_adopter: boolean
}

// Tier pricing (in cents for ZAR)
export const TIER_PRICING = {
  free: { monthly: 0, quarterly: 0, annual: 0 },
  premium: { 
    monthly: 4900, // R49
    quarterly: 13300, // R133 (10% discount)
    annual: 47000 // R470 (20% discount)
  },
  business: { 
    monthly: 17900, // R179
    quarterly: 48400, // R484 (10% discount) 
    annual: 172200 // R1722 (20% discount)
  }
}

// Early adopter pricing (first 500 users)
export const EARLY_ADOPTER_PRICING = {
  premium: { monthly: 2900 }, // R29 (41% off)
  business: { monthly: 9900 }  // R99 (45% off)
}

/**
 * Get user's current subscription and tier limits
 */
export async function getUserSubscription(userId?: string): Promise<UserSubscription | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = userId || user?.id
    
    if (!targetUserId) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        subscription_tier,
        subscription_status,
        subscription_start_date,
        subscription_end_date,
        trial_end_date,
        verified_seller,
        early_adopter
      `)
      .eq('id', targetUserId)
      .single()

    if (error) throw error
    return profile
  } catch (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }
}

/**
 * Get default tier limits based on tier
 */
function getDefaultTierLimits(tier: 'free' | 'premium' | 'business'): TierLimits {
  const baseLimits = {
    tier,
    current_listings: 0,
    can_create_listing: true,
    verified_badge: false,
    watermark_removed: false,
  }

  switch (tier) {
    case 'free':
      return {
        ...baseLimits,
        max_listings: 3,
        max_images: 5,
        max_videos: 0,
        listing_duration_days: 7,
        gallery_types: ['hover', 'horizontal', 'vertical', 'gallery']
      }
    case 'premium':
      return {
        ...baseLimits,
        max_listings: -1,
        max_images: 8,
        max_videos: 1,
        listing_duration_days: 35,
        verified_badge: true,
        watermark_removed: true,
        gallery_types: ['hover', 'horizontal', 'vertical', 'gallery', 'before_after', 'video']
      }
    case 'business':
      return {
        ...baseLimits,
        max_listings: -1,
        max_images: 20,
        max_videos: 5,
        listing_duration_days: 60,
        verified_badge: true,
        watermark_removed: true,
        gallery_types: ['hover', 'horizontal', 'vertical', 'gallery', 'before_after', 'video', 'premium']
      }
    default:
      return getDefaultTierLimits('free')
  }
}

/**
 * Get tier limits for a user
 */
export async function getUserTierLimits(userId?: string): Promise<TierLimits | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = userId || user?.id
    
    if (!targetUserId) return null

    const { data, error } = await supabase.rpc('check_user_tier_limits', {
      user_id: targetUserId
    })

    if (error) {
      console.error('Error fetching tier limits, using defaults:', error)
      // Fallback: get user profile to determine tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', targetUserId)
        .single()
      
      const tier = profile?.subscription_tier || 'free'
      return getDefaultTierLimits(tier as 'free' | 'premium' | 'business')
    }
    
    return data as TierLimits
  } catch (error) {
    console.error('Error fetching tier limits:', error)
    // Ultimate fallback: assume free tier
    return getDefaultTierLimits('free')
  }
}

/**
 * Check if user can create a new listing
 */
export async function canCreateListing(): Promise<boolean> {
  const limits = await getUserTierLimits()
  return limits?.can_create_listing ?? false
}

/**
 * Check if user can upload a certain number of images
 */
export async function canUploadImages(imageCount: number): Promise<boolean> {
  const limits = await getUserTierLimits()
  return limits ? imageCount <= limits.max_images : false
}

/**
 * Check if user can upload videos
 */
export async function canUploadVideos(videoCount: number): Promise<boolean> {
  const limits = await getUserTierLimits()
  if (!limits) return false
  
  return limits.max_videos === -1 || videoCount <= limits.max_videos
}

/**
 * Check if user has access to gallery type
 */
export async function hasGalleryAccess(galleryType: string): Promise<boolean> {
  const limits = await getUserTierLimits()
  return limits?.gallery_types.includes(galleryType) ?? false
}

/**
 * Upgrade user to premium tier
 */
export async function upgradeToPremium(userId: string, isEarlyAdopter = false): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'premium',
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        verified_seller: true,
        early_adopter: isEarlyAdopter
      })
      .eq('id', userId)

    return !error
  } catch (error) {
    console.error('Error upgrading to premium:', error)
    return false
  }
}

/**
 * Check if user's trial has expired
 */
export async function isTrialExpired(userId?: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  if (!subscription?.trial_end_date) return false
  
  return new Date(subscription.trial_end_date) < new Date()
}

/**
 * Get days remaining in trial
 */
export async function getTrialDaysRemaining(userId?: string): Promise<number> {
  const subscription = await getUserSubscription(userId)
  if (!subscription?.trial_end_date) return 0
  
  const trialEnd = new Date(subscription.trial_end_date)
  const now = new Date()
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return `R${(cents / 100).toFixed(0)}`
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: string): string {
  switch (tier) {
    case 'free': return 'Free'
    case 'premium': return 'Premium'
    case 'business': return 'Business'
    default: return 'Free'
  }
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier: string): string {
  switch (tier) {
    case 'free': return 'text-gray-600'
    case 'premium': return 'text-emerald-600'
    case 'business': return 'text-blue-600'
    default: return 'text-gray-600'
  }
}

/**
 * Add last_free_reset field to profiles table (migration needed)
 * This tracks when a free user's account was last reset
 */
export interface ProfileUpdate {
  last_free_reset?: string
  current_listings?: number
}
