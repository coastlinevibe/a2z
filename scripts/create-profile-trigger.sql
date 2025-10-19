-- Create a function that will be triggered when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Extract the selected plan from user metadata
  DECLARE
    selected_plan text := COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free');
    user_tier text := CASE 
      WHEN selected_plan = 'premium' THEN 'premium'
      WHEN selected_plan = 'business' THEN 'business'
      ELSE 'free'
    END;
    is_early_adopter boolean := user_tier != 'free';
    is_verified boolean := user_tier != 'free';
    sub_status text := CASE 
      WHEN user_tier = 'free' THEN 'active'
      ELSE 'trial'
    END;
    sub_end_date timestamptz := CASE 
      WHEN user_tier != 'free' THEN NOW() + INTERVAL '30 days'
      ELSE NULL
    END;
  BEGIN
    -- Insert the new profile
    INSERT INTO public.profiles (
      id,
      tier,
      subscription_status,
      subscription_end_date,
      early_adopter,
      verified_seller,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      user_tier,
      sub_status,
      sub_end_date,
      is_early_adopter,
      is_verified,
      NOW(),
      NOW()
    );
    
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
