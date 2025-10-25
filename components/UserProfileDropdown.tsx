"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { UserDropdown } from '@/components/ui/user-dropdown';

interface UserProfile {
  subscription_tier: 'free' | 'premium' | 'business';
  subscription_status: 'active' | 'inactive' | 'trial' | 'expired';
  subscription_end_date: string | null;
  verified_seller: boolean;
  early_adopter: boolean;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export function UserProfileDropdown() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      
      // Subscribe to profile changes
      const subscription = supabase
        .channel('profile-dropdown-changes')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles',
            filter: `id=eq.${user.id}`
          }, 
          (payload) => {
            console.log('Profile updated in dropdown:', payload)
            fetchUserProfile()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, subscription_end_date, verified_seller, early_adopter, display_name, username, avatar_url')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile({
          subscription_tier: 'free',
          subscription_status: 'active',
          subscription_end_date: null,
          verified_seller: false,
          early_adopter: false,
          display_name: null,
          username: null,
          avatar_url: null
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    switch (action) {
      case 'profile':
        router.push('/profile');
        break;
      case 'settings':
        router.push('/settings');
        break;
      case 'upgrade':
        router.push('/pricing');
        break;
      case 'referrals':
        router.push('/referrals');
        break;
      case 'help':
        const message = encodeURIComponent('Hi! I need support with A2Z Marketplace.')
        window.open(`https://wa.me/27714329190?text=${message}`, '_blank')
        break;
      case 'logout':
        await signOut();
        router.push('/');
        break;
      default:
        break;
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
    );
  }

  // Generate initials from display name or email
  const getInitials = () => {
    if (profile.display_name) {
      return profile.display_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  // Generate username if not set
  const getUsername = () => {
    if (profile.username) {
      return `@${profile.username}`;
    }
    if (user.email) {
      return `@${user.email.split('@')[0]}`;
    }
    return '@user';
  };

  const userData = {
    name: profile.display_name || user.email?.split('@')[0] || 'User',
    username: getUsername(),
    avatar: profile.avatar_url || '',
    initials: getInitials(),
    tier: profile.subscription_tier
  };

  return (
    <UserDropdown
      user={userData}
      onAction={handleAction}
    />
  );
}
