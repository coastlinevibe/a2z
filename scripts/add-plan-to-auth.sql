-- Add plan column to auth.users raw_user_meta_data
-- This will be handled through user metadata, no direct column needed

-- Update the profile creation trigger to handle plan transfer
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    created_at,
    subscription_tier,
    subscription_status,
    subscription_start_date
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free') = 'free' THEN 'active'
      ELSE 'pending'
    END,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
