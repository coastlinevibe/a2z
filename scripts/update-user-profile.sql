-- Update existing user profile to Premium
-- Replace 'your-user-id' with the actual user ID from the profiles table

UPDATE profiles 
SET 
  tier = 'premium',
  subscription_status = 'trial',
  subscription_end_date = NOW() + INTERVAL '30 days',
  early_adopter = true,
  verified_seller = true,
  updated_at = NOW()
WHERE id = 'd70d6ca8-4539-4d2b-b528-86af1b0c7c5f'; -- Replace with your actual user ID

-- Verify the update
SELECT id, tier, subscription_status, subscription_end_date, early_adopter, verified_seller
FROM profiles 
WHERE id = 'd70d6ca8-4539-4d2b-b528-86af1b0c7c5f'; -- Replace with your actual user ID
