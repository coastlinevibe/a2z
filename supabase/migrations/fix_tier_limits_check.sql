-- Fix the tier limits check to allow creation when current < max
CREATE OR REPLACE FUNCTION check_user_tier_limits(user_id UUID)
RETURNS JSON AS $$
DECLARE
  profile_data RECORD;
  active_count INTEGER;
  result JSON;
BEGIN
  -- Get user profile
  SELECT subscription_tier, subscription_status, verified_seller, early_adopter
  INTO profile_data
  FROM profiles
  WHERE id = user_id;

  -- Count active listings
  SELECT COUNT(*)
  INTO active_count
  FROM posts
  WHERE user_id = check_user_tier_limits.user_id
    AND is_active = true;

  -- Build result based on tier
  CASE profile_data.subscription_tier
    WHEN 'free' THEN
      result := json_build_object(
        'tier', 'free',
        'max_listings', 3,
        'max_images', 5,
        'max_videos', 0,
        'listing_duration_days', 7,
        'current_listings', active_count,
        'can_create_listing', active_count < 3,
        'verified_badge', false,
        'watermark_removed', false,
        'gallery_types', ARRAY['hover', 'horizontal', 'vertical', 'gallery']
      );
    WHEN 'premium' THEN
      result := json_build_object(
        'tier', 'premium',
        'max_listings', -1,
        'max_images', 8,
        'max_videos', 1,
        'listing_duration_days', 35,
        'current_listings', active_count,
        'can_create_listing', true,
        'verified_badge', COALESCE(profile_data.verified_seller, false),
        'watermark_removed', true,
        'gallery_types', ARRAY['hover', 'horizontal', 'vertical', 'gallery', 'before_after', 'video']
      );
    WHEN 'business' THEN
      result := json_build_object(
        'tier', 'business',
        'max_listings', -1,
        'max_images', 20,
        'max_videos', 5,
        'listing_duration_days', 60,
        'current_listings', active_count,
        'can_create_listing', true,
        'verified_badge', COALESCE(profile_data.verified_seller, false),
        'watermark_removed', true,
        'gallery_types', ARRAY['hover', 'horizontal', 'vertical', 'gallery', 'before_after', 'video', 'premium']
      );
    ELSE
      -- Default to free tier
      result := json_build_object(
        'tier', 'free',
        'max_listings', 3,
        'max_images', 5,
        'max_videos', 0,
        'listing_duration_days', 7,
        'current_listings', active_count,
        'can_create_listing', active_count < 3,
        'verified_badge', false,
        'watermark_removed', false,
        'gallery_types', ARRAY['hover', 'horizontal', 'vertical', 'gallery']
      );
  END CASE;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
