"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { AlertTriangle, Clock, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface ExpirationInfo {
  user_tier: 'free' | 'premium' | 'business';
  has_expiration: boolean;
  total_files?: number;
  expiring_soon_count?: number;
  next_expiration?: string;
  days_until_next_expiration?: number;
  message?: string;
}

export function MediaExpirationWarning() {
  const { user } = useAuth();
  const [expirationInfo, setExpirationInfo] = useState<ExpirationInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchExpirationInfo();
    }
  }, [user]);

  const fetchExpirationInfo = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_media_expiration');
      
      if (error) {
        console.error('Error fetching expiration info:', error);
        return;
      }
      
      setExpirationInfo(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !expirationInfo || !expirationInfo.has_expiration) {
    return null;
  }

  const daysUntilExpiration = expirationInfo.days_until_next_expiration || 0;
  const isUrgent = daysUntilExpiration <= 1;
  const isWarning = daysUntilExpiration <= 3;

  return (
    <div className={`rounded-lg border px-3 py-2 ${
      isUrgent 
        ? 'bg-red-50 border-red-200' 
        : isWarning 
        ? 'bg-amber-50 border-amber-200' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className={`${
            isUrgent 
              ? 'text-red-600' 
              : isWarning 
              ? 'text-amber-600' 
              : 'text-blue-600'
          }`}>
            {isUrgent ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              {expirationInfo.expiring_soon_count && expirationInfo.expiring_soon_count > 0 ? (
                <>
                  <span className="text-red-600 font-semibold">Reminder:</span> <strong>{expirationInfo.expiring_soon_count}</strong> images will be deleted in the next 24 hours.
                </>
              ) : (
                <>
                  <span className="text-red-600 font-semibold">Reminder:</span> Your images are automatically deleted after 7 days on the Free plan.
                  {daysUntilExpiration > 0 && (
                    <> Next deletion in <strong>{Math.ceil(daysUntilExpiration)} days</strong>.</>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/pricing">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3 py-1 h-7">
              <Crown className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
