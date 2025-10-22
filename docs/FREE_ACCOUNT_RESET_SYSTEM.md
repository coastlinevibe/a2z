# A2Z Free Account Reset System

## Overview
The A2Z Free Account Reset System implements a weekly cycle for free tier users where their listings and images are automatically deleted every 7 days, while preserving their profile information. This encourages upgrades to Premium while providing a fair trial experience.

## Key Features

### 1. Weekly Reset Cycle
- **Trigger**: Based on user registration date (not calendar weeks)
- **Frequency**: Every 7 days from registration
- **Scope**: Deletes all posts and associated media
- **Preservation**: Profile data (name, email, username, etc.) remains intact

### 2. Notification System
- **Day 6 Warning**: "Your 7-day cycle ends in 24 hours. Profile details stay — listings and images will be cleared automatically."
- **Day 7 Reset**: "Your 7-day cycle has reset. Listings and images cleared — start fresh or upgrade to keep them longer."
- **Display**: In-app banners with upgrade prompts

### 3. Dashboard Integration
- **Progress Bar**: Shows days remaining in current cycle
- **Counter**: Visual indicator of reset timeline
- **Upgrade Prompts**: Contextual calls-to-action

## Implementation

### Core Files

#### `lib/freeAccountReset.ts`
- `calculateNextResetDate()`: Determines when next reset occurs
- `getFreeAccountResetInfo()`: Gets reset status for a user
- `resetFreeAccount()`: Performs the actual reset
- `batchResetFreeAccounts()`: Processes all users due for reset

#### `components/FreeAccountNotifications.tsx`
- Warning banners for day 6 and day 7
- Progress bar showing cycle status
- Upgrade prompts with direct links to pricing

#### `components/UpgradePromptModal.tsx`
- Modal triggered by reset events
- Premium vs Business tier comparison
- Early adopter pricing display

### API Endpoints

#### `app/api/cron/free-account-reset/route.ts`
- **POST**: Daily cron job endpoint
- **GET**: Manual testing (dev only)
- **Authentication**: Bearer token via `CRON_SECRET`

### Automation

#### `.github/workflows/free-account-reset.yml`
- GitHub Actions workflow
- Runs daily at midnight UTC
- Calls the cron API endpoint
- Requires `VERCEL_URL` and `CRON_SECRET` secrets

## Database Requirements

### Profile Table Updates
Add these fields to the `profiles` table:
```sql
ALTER TABLE profiles 
ADD COLUMN last_free_reset TIMESTAMPTZ,
ADD COLUMN current_listings INTEGER DEFAULT 0;
```

### Reset Logic
1. Calculate days since registration
2. Determine if user is due for reset (every 7 days)
3. Delete all posts for the user
4. Update `last_free_reset` timestamp
5. Reset `current_listings` counter

## Configuration

### Environment Variables
```env
CRON_SECRET=your-secure-random-string
VERCEL_URL=https://your-app.vercel.app
```

### Cron Schedule
- **Production**: Daily at midnight UTC
- **Testing**: Manual trigger via API or GitHub Actions

## User Experience Flow

### Day 1-5: Normal Usage
- User creates listings within free tier limits
- No reset notifications shown
- Progress bar shows time remaining

### Day 6: Warning Phase
- Yellow warning banner appears
- "24 hours remaining" message
- Upgrade prompt with pricing

### Day 7: Reset Day
- Blue notification banner
- "Cycle has reset" message
- All listings and images deleted
- Profile data preserved
- Upgrade prompt displayed

### Day 8: Fresh Start
- User can create new listings
- Cycle counter resets to 7 days
- Process repeats

## Upgrade Triggers

### Automatic Prompts
1. **Reset Event**: When account is reset
2. **Limit Reached**: When hitting free tier limits
3. **Feature Locked**: When accessing premium features

### Prompt Content
- Early adopter pricing (45% off first 500 users)
- Feature comparison (Premium vs Business)
- Direct links to upgrade flow

## Testing

### Manual Testing
```bash
# Development only - triggers reset job
GET /api/cron/free-account-reset
```

### Production Testing
```bash
# Trigger via cron endpoint
curl -X POST "https://your-app.vercel.app/api/cron/free-account-reset" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Monitoring

### Logs
- Reset job execution results
- Success/failure counts
- Individual user reset status

### Metrics to Track
- Free users approaching reset
- Reset completion rates
- Upgrade conversion from reset prompts
- User retention after reset

## Security Considerations

### Cron Authentication
- Bearer token authentication required
- Secret stored in environment variables
- Request validation in API endpoint

### Data Preservation
- Profile data never deleted
- User authentication preserved
- Subscription status maintained

## Future Enhancements

### Potential Improvements
1. **Email Notifications**: Send reset warnings via email
2. **Grace Period**: Allow 24-hour recovery window
3. **Selective Preservation**: Keep top-performing listings
4. **Analytics Integration**: Track reset impact on user behavior

### Customization Options
1. **Variable Cycles**: Different reset periods for different regions
2. **Seasonal Adjustments**: Extended cycles during holidays
3. **User Preferences**: Opt-in for different reset schedules

## Troubleshooting

### Common Issues
1. **Cron Job Failures**: Check `CRON_SECRET` and network connectivity
2. **Database Errors**: Verify table schema and permissions
3. **Notification Issues**: Check user subscription tier detection

### Debug Commands
```typescript
// Check user reset status
const resetInfo = await getFreeAccountResetInfo(userId)

// Manual reset for testing
const success = await resetFreeAccount(userId)

// Get all users due for reset
const users = await getFreeUsersForReset()
```

## Deployment Checklist

- [ ] Add `last_free_reset` column to profiles table
- [ ] Set `CRON_SECRET` environment variable
- [ ] Configure GitHub Actions secrets
- [ ] Test cron endpoint manually
- [ ] Verify notification display for free users
- [ ] Test upgrade flow from reset prompts
- [ ] Monitor first automated reset cycle
