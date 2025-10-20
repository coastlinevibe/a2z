# Analytics System - A2Z Platform

## Overview
Comprehensive analytics system tracking views, clicks, traffic sources, and user behavior across all listings.

## ✅ Implemented Features

### 1. Database Schema

#### analytics_events Table
Detailed event tracking for every interaction:
- Event types: view, click, whatsapp_click, phone_click, share
- Session and visitor tracking
- UTM parameters (source, medium, campaign)
- Device information (type, browser, OS)
- IP address and location
- Referrer tracking

#### analytics_summary Table
Aggregated daily statistics for fast queries:
- Daily views and unique views
- Click counts by type
- Engagement metrics
- Bounce rate tracking

### 2. Tracking System

#### Client-Side Tracking
```typescript
import { trackPageView, trackWhatsAppClick, trackPhoneClick } from '@/lib/analytics/tracker'

// Track page view
trackPageView(postId, userId)

// Track WhatsApp click
trackWhatsAppClick(postId, userId)

// Track phone click
trackPhoneClick(postId, userId)
```

#### Automatic Tracking
- Visitor ID (localStorage)
- Session ID (sessionStorage)
- UTM parameters from URL
- Device detection
- Browser and OS detection
- Referrer capture

### 3. API Endpoints

#### Track Event
**POST** `/api/analytics/track`
```json
{
  "event_type": "view",
  "post_id": "uuid",
  "user_id": "uuid",
  "session_id": "session-id",
  "visitor_id": "visitor-id",
  "referrer": "https://google.com",
  "utm_source": "facebook",
  "utm_medium": "social",
  "device_type": "mobile",
  "browser": "Chrome",
  "os": "Android"
}
```

#### Get Statistics
**GET** `/api/analytics/stats?post_id=uuid&days=30`

Response:
```json
{
  "success": true,
  "totals": {
    "views": 1250,
    "unique_views": 890,
    "clicks": 145,
    "whatsapp_clicks": 89,
    "phone_clicks": 34,
    "shares": 22
  },
  "daily": [...],
  "sources": {
    "Facebook": 450,
    "Google": 320,
    "Direct": 280
  },
  "devices": {
    "mobile": 750,
    "desktop": 400,
    "tablet": 100
  }
}
```

### 4. UI Components

#### AnalyticsDashboard
```tsx
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'

<AnalyticsDashboard postId={postId} days={30} />
```

Features:
- Total views, unique views, clicks
- WhatsApp and phone click tracking
- Share count
- Click-through rate
- Traffic sources breakdown
- Device breakdown
- 30-day historical data

### 5. Real-Time Counters

Posts table includes real-time counters:
- `views` - Total page views
- `clicks` - Total clicks (all types)

Updated via RPC functions:
```sql
SELECT increment_post_views('post-id');
SELECT increment_post_clicks('post-id');
```

## 📊 Metrics Tracked

### Engagement Metrics
- **Views** - Page loads
- **Unique Views** - Distinct visitors
- **Clicks** - All interaction clicks
- **WhatsApp Clicks** - Contact via WhatsApp
- **Phone Clicks** - Contact via phone
- **Shares** - Social sharing

### Traffic Analysis
- **Sources** - Where visitors come from
- **UTM Tracking** - Campaign performance
- **Referrers** - External links
- **Direct Traffic** - No referrer

### Device Analytics
- **Device Type** - Mobile, Desktop, Tablet
- **Browser** - Chrome, Safari, Firefox, etc.
- **Operating System** - Windows, macOS, Android, iOS

### Session Tracking
- **Visitor ID** - Unique across sessions
- **Session ID** - Unique per browsing session
- **Time on Page** - Engagement duration
- **Bounce Rate** - Single-page sessions

## 🔧 Usage Examples

### Track Page View (Automatic)
```tsx
import { usePageView } from '@/lib/analytics'

function PostPage({ postId }) {
  usePageView(postId) // Automatically tracks on mount
  
  return <div>...</div>
}
```

### Track Manual Events
```tsx
import { trackWhatsAppClick, trackPhoneClick, trackShare } from '@/lib/analytics/tracker'

function ContactButtons({ postId }) {
  return (
    <>
      <button onClick={() => trackWhatsAppClick(postId)}>
        WhatsApp
      </button>
      <button onClick={() => trackPhoneClick(postId)}>
        Call
      </button>
      <button onClick={() => trackShare(postId, 'facebook')}>
        Share
      </button>
    </>
  )
}
```

### Display Analytics
```tsx
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'

function MyListingAnalytics({ postId }) {
  return (
    <div>
      <h2>Performance</h2>
      <AnalyticsDashboard postId={postId} days={30} />
    </div>
  )
}
```

## 🔐 Security & Privacy

### RLS Policies
- Users can only view analytics for their own posts
- Admins can view all analytics
- Anyone can insert events (tracking)

### Data Privacy
- IP addresses stored but not exposed to users
- No personally identifiable information
- GDPR compliant (anonymous tracking)
- Users can opt-out via browser settings

### Rate Limiting
- Deduplication: Same view not counted within 30 minutes
- Session-based tracking prevents spam
- Non-blocking: Analytics failures don't break UX

## 📈 Performance Optimization

### Aggregation Strategy
1. **Real-time**: Events inserted immediately
2. **Daily Summary**: Aggregated overnight via cron
3. **Fast Queries**: Summary table for dashboards

### Indexes
```sql
-- Fast event queries
CREATE INDEX idx_analytics_post_id ON analytics_events(post_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- Fast summary queries
CREATE INDEX idx_analytics_summary_post ON analytics_summary(post_id);
CREATE INDEX idx_analytics_summary_date ON analytics_summary(date DESC);
```

### Caching
- Summary data cached for 1 hour
- Real-time counters updated immediately
- Background aggregation for historical data

## 🔄 Data Aggregation

### Daily Summary Update
Run nightly via cron or Supabase function:
```sql
SELECT update_analytics_summary();
```

This aggregates yesterday's events into the summary table.

### Manual Aggregation
```sql
-- Aggregate specific date
INSERT INTO analytics_summary (post_id, date, views, unique_views, ...)
SELECT 
  post_id,
  DATE(created_at),
  COUNT(*) FILTER (WHERE event_type = 'view'),
  COUNT(DISTINCT visitor_id) FILTER (WHERE event_type = 'view'),
  ...
FROM analytics_events
WHERE DATE(created_at) = '2025-10-20'
GROUP BY post_id, DATE(created_at);
```

## 📱 Mobile Tracking

### Responsive Detection
Automatically detects:
- Mobile devices (phones)
- Tablets
- Desktop computers

### Touch Events
Tracks touch interactions on mobile:
- Tap events
- Swipe gestures
- Long press

## 🎯 Campaign Tracking

### UTM Parameters
Track marketing campaigns:
```
https://a2z.co.za/listing/abc?utm_source=facebook&utm_medium=social&utm_campaign=summer_sale
```

Captured automatically:
- `utm_source` - Traffic source (facebook, google, email)
- `utm_medium` - Medium (social, cpc, email)
- `utm_campaign` - Campaign name

### Custom Tracking
Add custom metadata:
```typescript
trackEvent({
  event_type: 'view',
  post_id: postId,
  metadata: {
    campaign: 'summer_sale',
    variant: 'A',
    experiment: 'pricing_test'
  }
})
```

## 🚀 Future Enhancements

### Planned Features
1. **Heatmaps** - Click position tracking
2. **Scroll Depth** - How far users scroll
3. **Time on Page** - Engagement duration
4. **Conversion Funnels** - View → Click → Contact
5. **A/B Testing** - Variant performance
6. **Real-time Dashboard** - Live analytics
7. **Export Reports** - CSV/PDF downloads
8. **Email Reports** - Weekly summaries
9. **Alerts** - Unusual activity notifications
10. **Competitor Analysis** - Market insights

### Advanced Analytics
- **Cohort Analysis** - User retention
- **Attribution Modeling** - Multi-touch attribution
- **Predictive Analytics** - ML-based insights
- **Custom Dashboards** - User-defined metrics

## 🐛 Troubleshooting

### Events Not Tracking
1. Check browser console for errors
2. Verify API endpoint is accessible
3. Check RLS policies allow insertion
4. Ensure service role key is set

### Missing Data
1. Run summary aggregation manually
2. Check date range in queries
3. Verify post_id is correct
4. Check for deleted posts

### Performance Issues
1. Add more indexes if needed
2. Increase aggregation frequency
3. Archive old events (>90 days)
4. Use summary table for dashboards

## 📊 Example Queries

### Top Performing Posts
```sql
SELECT 
  p.title,
  SUM(a.views) as total_views,
  SUM(a.clicks) as total_clicks
FROM analytics_summary a
JOIN posts p ON p.id = a.post_id
WHERE a.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.title
ORDER BY total_views DESC
LIMIT 10;
```

### Traffic Sources
```sql
SELECT 
  COALESCE(utm_source, referrer, 'Direct') as source,
  COUNT(*) as visits
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY source
ORDER BY visits DESC;
```

### Device Breakdown
```sql
SELECT 
  device_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM analytics_events
WHERE event_type = 'view'
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY device_type;
```

---

**Status:** ✅ Production Ready  
**Last Updated:** 2025-10-20  
**Version:** 1.0.0
