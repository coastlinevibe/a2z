import { supabase } from './supabaseClient'

export interface FreeAccountResetInfo {
  userId: string
  registrationDate: Date
  nextResetDate: Date
  daysUntilReset: number
  isResetDay: boolean
  isWarningDay: boolean
}

/**
 * Calculate the next reset date based on registration date
 * Free accounts reset every 7 days from their registration date
 */
export function calculateNextResetDate(registrationDate: Date): Date {
  const now = new Date()
  const regDate = new Date(registrationDate)
  
  // Calculate how many 7-day cycles have passed since registration
  const daysSinceReg = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24))
  const cyclesPassed = Math.floor(daysSinceReg / 7)
  
  // Next reset is at the start of the next cycle
  const nextReset = new Date(regDate)
  nextReset.setDate(regDate.getDate() + ((cyclesPassed + 1) * 7))
  nextReset.setHours(0, 0, 0, 0) // Reset at midnight
  
  return nextReset
}

/**
 * Get reset information for a free user
 */
export async function getFreeAccountResetInfo(userId?: string): Promise<FreeAccountResetInfo | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = userId || user?.id
    
    if (!targetUserId) return null

    // Get user profile with subscription info
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_tier, created_at')
      .eq('id', targetUserId)
      .single()

    if (error || !profile) return null
    
    // Only apply to free tier users
    if (profile.subscription_tier !== 'free') return null

    const registrationDate = new Date(profile.created_at)
    const nextResetDate = calculateNextResetDate(registrationDate)
    const now = new Date()
    
    const daysUntilReset = Math.ceil((nextResetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isResetDay = daysUntilReset <= 0
    const isWarningDay = daysUntilReset === 1

    return {
      userId: targetUserId,
      registrationDate,
      nextResetDate,
      daysUntilReset: Math.max(0, daysUntilReset),
      isResetDay,
      isWarningDay
    }
  } catch (error) {
    console.error('Error getting free account reset info:', error)
    return null
  }
}

/**
 * Check if a free user needs to be reset today
 */
export async function shouldResetFreeAccount(userId: string): Promise<boolean> {
  const resetInfo = await getFreeAccountResetInfo(userId)
  return resetInfo?.isResetDay ?? false
}

/**
 * Reset a free user's account (delete listings and images, keep profile)
 */
export async function resetFreeAccount(userId: string): Promise<boolean> {
  try {
    // Verify this is a free account that needs reset
    const resetInfo = await getFreeAccountResetInfo(userId)
    if (!resetInfo?.isResetDay) {
      console.log(`User ${userId} does not need reset today`)
      return false
    }

    // Delete all posts for this user
    const { error: postsError } = await supabase
      .from('posts')
      .delete()
      .eq('user_id', userId)

    if (postsError) {
      console.error('Error deleting posts:', postsError)
      return false
    }

    // Update profile to mark last reset
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        last_free_reset: new Date().toISOString(),
        // Reset any usage counters if they exist
        current_listings: 0
      })
      .eq('id', userId)

    if (profileError) {
      console.error('Error updating profile after reset:', profileError)
      return false
    }

    console.log(`Successfully reset free account for user ${userId}`)
    return true
  } catch (error) {
    console.error('Error resetting free account:', error)
    return false
  }
}

/**
 * Get all free users who need to be reset today
 */
export async function getFreeUsersForReset(): Promise<string[]> {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, created_at, subscription_tier')
      .eq('subscription_tier', 'free')

    if (error) {
      console.error('Error fetching free users:', error)
      return []
    }

    const usersToReset: string[] = []
    const now = new Date()

    for (const profile of profiles) {
      const registrationDate = new Date(profile.created_at)
      const nextResetDate = calculateNextResetDate(registrationDate)
      
      // Check if reset date is today or overdue
      if (nextResetDate <= now) {
        usersToReset.push(profile.id)
      }
    }

    return usersToReset
  } catch (error) {
    console.error('Error getting free users for reset:', error)
    return []
  }
}

/**
 * Batch reset all free accounts that are due for reset
 */
export async function batchResetFreeAccounts(): Promise<{ success: number; failed: number }> {
  const usersToReset = await getFreeUsersForReset()
  let success = 0
  let failed = 0

  console.log(`Starting batch reset for ${usersToReset.length} free accounts`)

  for (const userId of usersToReset) {
    const resetSuccess = await resetFreeAccount(userId)
    if (resetSuccess) {
      success++
    } else {
      failed++
    }
  }

  console.log(`Batch reset completed: ${success} successful, ${failed} failed`)
  return { success, failed }
}
