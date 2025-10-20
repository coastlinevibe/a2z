"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useHydrated } from '@/hooks/useHydrated';

interface CleanupStats {
  total_files: number;
  active_files: number;
  deleted_files: number;
  free_tier_files: number;
  premium_files: number;
  files_expiring_soon: number;
}

interface CleanupResponse {
  success: boolean;
  stats?: CleanupStats;
  result?: any;
  error?: string;
  timestamp: string;
}

export function CleanupMonitor() {
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const hydrated = useHydrated();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cleanup-expired-images');
      const data: CleanupResponse = await response.json();
      
      if (data.success && data.stats) {
        setStats(data.stats);
        setLastUpdate(data.timestamp);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch stats' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error fetching stats' });
    } finally {
      setLoading(false);
    }
  };

  const triggerCleanup = async () => {
    setCleanupLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/cleanup-expired-images', {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_CLEANUP_API_KEY || 'dev-key'
        }
      });
      
      const data: CleanupResponse = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Cleanup triggered successfully!' });
        // Refresh stats after cleanup
        setTimeout(fetchStats, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Cleanup failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error triggering cleanup' });
    } finally {
      setCleanupLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Media Cleanup Monitor</h3>
          <p className="text-sm text-gray-600">
            Monitor and manage expired image cleanup for free tier users
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={triggerCleanup}
            disabled={cleanupLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className={`h-4 w-4 mr-1 ${cleanupLoading ? 'animate-pulse' : ''}`} />
            {cleanupLoading ? 'Running...' : 'Run Cleanup'}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total_files}</div>
            <div className="text-sm text-blue-600">Total Files</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.active_files}</div>
            <div className="text-sm text-green-600">Active Files</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.deleted_files}</div>
            <div className="text-sm text-red-600">Deleted Files</div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{stats.free_tier_files}</div>
            <div className="text-sm text-amber-600">Free Tier Files</div>
          </div>
          
          <div className="bg-emerald-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{stats.premium_files}</div>
            <div className="text-sm text-emerald-600">Premium Files</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-orange-600">{stats.files_expiring_soon}</div>
              {stats.files_expiring_soon > 0 && (
                <Clock className="h-4 w-4 text-orange-600" />
              )}
            </div>
            <div className="text-sm text-orange-600">Expiring Soon</div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">
            {loading ? 'Loading stats...' : 'No stats available'}
          </div>
        </div>
      )}

      {lastUpdate && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {hydrated ? formatDate(lastUpdate) : 'Loading...'}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Cleanup Schedule</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Automated</Badge>
            <span>Daily at 2:00 AM UTC</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Manual</Badge>
            <span>Use "Run Cleanup" button above</span>
          </div>
        </div>
      </div>
    </div>
  );
}
