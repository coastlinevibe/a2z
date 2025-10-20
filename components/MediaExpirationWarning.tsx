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
    <div className={`rounded-lg border p-4 ${
      isUrgent 
        ? 'bg-red-50 border-red-200' 
        : isWarning 
        ? 'bg-amber-50 border-amber-200' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${
          isUrgent 
            ? 'text-red-600' 
            : isWarning 
            ? 'text-amber-600' 
            : 'text-blue-600'
        }`}>
          {isUrgent ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <Clock className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-semibold ${
              isUrgent 
                ? 'text-red-900' 
                : isWarning 
                ? 'text-amber-900' 
                : 'text-blue-900'
            }`}>
              {isUrgent 
                ? 'Images Expiring Soon!' 
                : isWarning 
                ? 'Images Will Expire Soon' 
                : 'Free Tier Storage Limit'
              }
            </h3>
            <Badge variant="outline" className="text-xs">
              Free Plan
            </Badge>
          </div>
          
          <div className="space-y-1 text-sm text-gray-700">
            {expirationInfo.expiring_soon_count && expirationInfo.expiring_soon_count > 0 ? (
              <p>
                <strong>{expirationInfo.expiring_soon_count}</strong> of your images will be deleted in the next 24 hours.
              </p>
            ) : (
              <p>
                Your images are automatically deleted after 7 days on the Free plan.
                {daysUntilExpiration > 0 && (
                  <> Next deletion in <strong>{Math.ceil(daysUntilExpiration)} days</strong>.</>
                )}
              </p>
            )}
            
            {expirationInfo.total_files && (
              <p className="text-gray-600">
                You currently have <strong>{expirationInfo.total_files}</strong> images stored.
              </p>
            )}
          </div>
          
          <div className="mt-3 flex gap-2">
            <Link href="/pricing">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Crown className="h-4 w-4 mr-1" />
                Upgrade to Premium
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchExpirationInfo}
            >
              Refresh
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            💡 Premium users get permanent storage with no expiration dates.
          </div>
        </div>
      </div>
    </div>
  );
}
