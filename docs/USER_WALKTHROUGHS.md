# A2Z Platform - User Testing Walkthroughs

## Overview
Comprehensive testing scenarios for Free and Premium tier users. Follow these step-by-step to verify all platform functionality.

---

# 🆓 FREE PLAN WALKTHROUGHS

## Walkthrough 1: New User Journey

### Scenario
First-time visitor discovers A2Z, signs up, and creates their first listing.

### Test Data
- **Email**: `freeuser1@test.com`
- **Password**: `Test123!@#`
- **Username**: `freeuser1`
- **Display Name**: `Free User One`

### Steps

#### 1. Landing Page Visit
- [ ] Navigate to `http://localhost:3000`
- [ ] **Verify**: Hero section displays "Everything A to Z"
- [ ] **Verify**: Pricing information visible
- [ ] **Verify**: "Get Started" or "Sign Up" button present

#### 2. Sign Up Process
- [ ] Click "Sign Up" button
- [ ] Enter email: `freeuser1@test.com`
- [ ] Enter password: `Test123!@#`
- [ ] Enter username: `freeuser1`
- [ ] Enter display name: `Free User One`
- [ ] **Verify**: No tier selection (defaults to Free)
- [ ] Click "Create Account"
- [ ] **Verify**: Redirected to dashboard or onboarding

#### 3. Dashboard First View
- [ ] **Verify**: Welcome message displays
- [ ] **Verify**: Tier badge shows "Free"
- [ ] **Verify**: Tier limits card shows: "3 listings, 5 images, 7 days expiry"
- [ ] **Verify**: "Create Listing" button visible
- [ ] **Verify**: Upgrade prompt visible

#### 4. Create First Listing
- [ ] Click "Create Listing" or "New Post"
- [ ] **Verify**: Watermark warning displays
- [ ] Enter title: `Test Laptop for Sale`
- [ ] Enter description: `Great condition laptop, barely used`
- [ ] Enter price: `5000`
- [ ] Select category: `Electronics`
- [ ] Upload 3 images (any JPG/PNG files)
- [ ] **Verify**: Watermark preview shows "A2Z.co.za" on images
- [ ] Enter contact: WhatsApp number
- [ ] Click "Publish"
- [ ] **Verify**: Success message
- [ ] **Verify**: Redirected to listing view

#### 5. View Published Listing
- [ ] **Verify**: Title displays correctly
- [ ] **Verify**: Images show with watermark
- [ ] **Verify**: Price displays: R5,000
- [ ] **Verify**: WhatsApp button works
- [ ] **Verify**: Share button present
- [ ] **Verify**: Analytics shows 1 view

#### 6. Test Tier Limits
- [ ] Go back to dashboard
- [ ] **Verify**: Usage shows "1/3 listings"
- [ ] Create 2 more listings (same process)
- [ ] **Verify**: Usage shows "3/3 listings"
- [ ] Try to create 4th listing
- [ ] **Verify**: Blocked with upgrade prompt
- [ ] **Verify**: "Upgrade to Premium" message displays

### Success Criteria
✅ Account created successfully  
✅ Free tier assigned automatically  
✅ Watermarks applied to images  
✅ 3 listing limit enforced  
✅ Upgrade prompts display correctly  
✅ All listings expire in 7 days

---

## Walkthrough 2: Active Free User Journey

### Scenario
Existing free user logs in, browses listings, contacts sellers, manages posts.

### Test Data
- **Email**: `freeuser2@test.com`
- **Password**: `Test123!@#`

### Steps

#### 1. Login
- [ ] Navigate to `/login`
- [ ] Enter email: `freeuser2@test.com`
- [ ] Enter password: `Test123!@#`
- [ ] Click "Sign In"
- [ ] **Verify**: Redirected to dashboard

#### 2. Browse Listings
- [ ] Click "Home" or "Browse"
- [ ] **Verify**: Grid of listings displays
- [ ] **Verify**: Watermarks visible on free tier images
- [ ] **Verify**: No watermarks on premium listings
- [ ] Click on a listing
- [ ] **Verify**: Full listing details display
- [ ] **Verify**: Contact buttons work

#### 3. Contact Seller
- [ ] On listing page, click "WhatsApp"
- [ ] **Verify**: Opens WhatsApp with pre-filled message
- [ ] **Verify**: Analytics tracks click
- [ ] Go back to listing
- [ ] Click "Share" button
- [ ] **Verify**: Share options display
- [ ] **Verify**: Share tracking works

#### 4. Search Functionality
- [ ] Use search bar
- [ ] Enter: `laptop`
- [ ] **Verify**: Relevant results display
- [ ] Apply filters (category, price range)
- [ ] **Verify**: Filters work correctly

#### 5. Manage Own Listings
- [ ] Go to "My Listings" or "Dashboard"
- [ ] **Verify**: All your posts display
- [ ] Click "Edit" on a listing
- [ ] Change title or price
- [ ] **Verify**: Can't upload more than 5 images total
- [ ] Save changes
- [ ] **Verify**: Changes saved successfully

#### 6. View Analytics
- [ ] On your listing, view analytics
- [ ] **Verify**: Views count displays
- [ ] **Verify**: Clicks count displays
- [ ] **Verify**: WhatsApp clicks tracked
- [ ] **Verify**: Traffic sources shown
- [ ] **Verify**: Device breakdown visible

#### 7. Profile Management
- [ ] Go to "Profile" or "Settings"
- [ ] Update display name
- [ ] Update bio
- [ ] Try to upload profile picture
- [ ] **Verify**: Profile updates save
- [ ] **Verify**: No verified badge (free tier)

### Success Criteria
✅ Login works smoothly  
✅ Browse and search functional  
✅ Contact features work  
✅ Analytics tracking accurate  
✅ Edit capabilities work within limits  
✅ Profile updates save correctly

---

## Walkthrough 3: Free Tier Limit Testing

### Scenario
Test all free tier restrictions and upgrade prompts.

### Test Data
- **Email**: `freeuser3@test.com`
- **Password**: `Test123!@#`

### Steps

#### 1. Test Listing Limit
- [ ] Create 1st listing
- [ ] **Verify**: "2 remaining" message
- [ ] Create 2nd listing
- [ ] **Verify**: "1 remaining" message
- [ ] Create 3rd listing
- [ ] **Verify**: "0 remaining" message
- [ ] **Verify**: Upgrade prompt displays
- [ ] Try to create 4th listing
- [ ] **Verify**: Blocked with modal
- [ ] **Verify**: "Upgrade to Premium" CTA

#### 2. Test Image Limit
- [ ] Edit existing listing
- [ ] Try to upload 6th image
- [ ] **Verify**: Blocked with message
- [ ] **Verify**: "Premium users get 8 images" message
- [ ] **Verify**: Current count shows "5/5"

#### 3. Test Watermark System
- [ ] Upload new image
- [ ] **Verify**: Watermark preview shows
- [ ] **Verify**: "A2Z.co.za" text visible
- [ ] **Verify**: Bottom-right position
- [ ] **Verify**: Upgrade prompt: "Remove watermarks with Premium"

#### 4. Test Expiration Warning
- [ ] View listing details
- [ ] **Verify**: "Expires in 7 days" badge
- [ ] **Verify**: Countdown timer accurate
- [ ] **Verify**: Warning message for expiring soon

#### 5. Test Gallery Restrictions
- [ ] Try to use "Before/After" gallery
- [ ] **Verify**: Locked with premium badge
- [ ] Try to use "Video" gallery
- [ ] **Verify**: Locked with premium badge
- [ ] **Verify**: Only basic galleries available

#### 6. Test Upgrade Prompts
- [ ] Count upgrade prompts on dashboard
- [ ] **Verify**: At least 3 upgrade CTAs visible
- [ ] Click "Upgrade to Premium"
- [ ] **Verify**: Redirects to `/pricing`
- [ ] **Verify**: Pricing page displays correctly
- [ ] **Verify**: Early adopter pricing shown (if applicable)

### Success Criteria
✅ 3 listing limit strictly enforced  
✅ 5 image limit per listing enforced  
✅ Watermarks applied automatically  
✅ 7-day expiration set  
✅ Premium features locked  
✅ Upgrade prompts clear and frequent

---

# 💎 PREMIUM PLAN WALKTHROUGHS

## Walkthrough 4: Upgrade Journey

### Scenario
Free user upgrades to Premium via payment flow.

### Test Data
- **Start as**: `freeuser1@test.com`
- **Upgrade to**: Premium

### Steps

#### 1. View Pricing Page
- [ ] Navigate to `/pricing`
- [ ] **Verify**: 3 tiers displayed (Free, Premium, Business)
- [ ] **Verify**: Premium shows R49/month (or R29 early adopter)
- [ ] **Verify**: Features list clear
- [ ] **Verify**: "Unlimited listings" highlighted

#### 2. Initiate Upgrade
- [ ] Click "Upgrade to Premium"
- [ ] **Verify**: Payment modal opens
- [ ] **Verify**: Price summary displays
- [ ] **Verify**: Early adopter discount applied (if eligible)

#### 3. Select Payment Method
- [ ] **Verify**: PayFast option displayed
- [ ] **Verify**: Manual EFT option displayed
- [ ] Select PayFast
- [ ] **Verify**: "Recommended" badge on PayFast

#### 4. Payment Flow (Test Mode)
- [ ] Click "Pay R49" (or R29)
- [ ] **Verify**: Redirected to PayFast (or test page)
- [ ] Complete test payment
- [ ] **Verify**: Redirected to `/payment/success`
- [ ] **Verify**: Success message displays

#### 5. Verify Upgrade
- [ ] Go to dashboard
- [ ] **Verify**: Tier badge now shows "Premium"
- [ ] **Verify**: Tier limits show "Unlimited listings"
- [ ] **Verify**: "8 images" limit displayed
- [ ] **Verify**: "35 days expiry" shown
- [ ] **Verify**: Watermark warning removed

#### 6. Test Premium Features
- [ ] Create new listing
- [ ] **Verify**: No watermark warning
- [ ] Upload 8 images
- [ ] **Verify**: All 8 accepted
- [ ] **Verify**: No watermarks applied
- [ ] Try "Before/After" gallery
- [ ] **Verify**: Now unlocked and functional

#### 7. Verify Badge
- [ ] Go to profile
- [ ] **Verify**: "Verified Seller" badge visible (if granted by admin)
- [ ] View your listing
- [ ] **Verify**: Badge shows on listing card

### Success Criteria
✅ Payment flow completes successfully  
✅ Tier upgraded to Premium  
✅ Limits updated correctly  
✅ Watermarks removed  
✅ Premium features unlocked  
✅ Verified badge displays (if applicable)

---

## Walkthrough 5: Premium Creator Journey

### Scenario
Premium user creates multiple listings with advanced features.

### Test Data
- **Email**: `premiumuser1@test.com`
- **Password**: `Test123!@#`
- **Tier**: Premium

### Steps

#### 1. Create Listing with Advanced Gallery
- [ ] Click "Create Listing"
- [ ] Enter title: `Luxury Apartment for Rent`
- [ ] Select gallery type: "Before/After"
- [ ] Upload before image
- [ ] Upload after image
- [ ] **Verify**: Slider works in preview
- [ ] **Verify**: No watermarks

#### 2. Create Video Listing
- [ ] Create new listing
- [ ] Enter title: `Car Showcase`
- [ ] Select gallery type: "Video"
- [ ] Upload video file (MP4)
- [ ] **Verify**: Video uploads successfully
- [ ] **Verify**: Video plays in preview
- [ ] **Verify**: No watermark on video

#### 3. Create Multiple Listings
- [ ] Create 5 listings rapidly
- [ ] **Verify**: No limit warnings
- [ ] **Verify**: All publish successfully
- [ ] **Verify**: Dashboard shows "5 active listings"
- [ ] **Verify**: No "X/3" limit counter

#### 4. Upload Maximum Images
- [ ] Create listing
- [ ] Upload 8 images
- [ ] **Verify**: All 8 accepted
- [ ] Try to upload 9th
- [ ] **Verify**: Blocked at 8 (Premium limit)
- [ ] **Verify**: Message: "Premium: 8 images max"

#### 5. Test Extended Expiration
- [ ] View listing details
- [ ] **Verify**: "Expires in 35 days" badge
- [ ] **Verify**: Not 7 days (free tier)
- [ ] **Verify**: Countdown accurate

#### 6. View Enhanced Analytics
- [ ] Go to listing analytics
- [ ] **Verify**: Detailed traffic sources
- [ ] **Verify**: Device breakdown
- [ ] **Verify**: Click-through rate
- [ ] **Verify**: 30-day history available

#### 7. Edit and Update
- [ ] Edit any listing
- [ ] Change all 8 images
- [ ] **Verify**: Updates save
- [ ] **Verify**: No watermarks on new images
- [ ] Change gallery type
- [ ] **Verify**: Gallery type updates

### Success Criteria
✅ Unlimited listings created  
✅ Advanced galleries work  
✅ 8 images per listing  
✅ No watermarks  
✅ 35-day expiration  
✅ Enhanced analytics available

---

## Walkthrough 6: Business Features Journey

### Scenario
Premium/Business user tests advanced profile and business features.

### Test Data
- **Email**: `businessuser1@test.com`
- **Password**: `Test123!@#`
- **Tier**: Business

### Steps

#### 1. Complete Profile Setup
- [ ] Go to "Profile Settings"
- [ ] Upload profile picture
- [ ] **Verify**: No watermark on avatar
- [ ] Add bio: `Professional seller since 2020`
- [ ] Add business name
- [ ] Add website URL
- [ ] Add social media links
- [ ] Save changes
- [ ] **Verify**: All fields save correctly

#### 2. Request Verification
- [ ] Look for "Get Verified" option
- [ ] **Verify**: Verification badge explained
- [ ] **Note**: Admin must grant verification
- [ ] Check if badge displays (if already verified)

#### 3. Create Business Listing
- [ ] Create listing with 20 images (Business tier)
- [ ] **Verify**: All 20 images accepted
- [ ] Add custom branding elements
- [ ] Use professional gallery type
- [ ] **Verify**: 60-day expiration set

#### 4. Bulk Operations
- [ ] Select multiple listings
- [ ] **Verify**: Bulk edit option available
- [ ] Try bulk price update
- [ ] **Verify**: All selected listings update
- [ ] Try bulk status change
- [ ] **Verify**: Can pause/activate multiple

#### 5. Advanced Analytics
- [ ] View analytics dashboard
- [ ] **Verify**: Full 90-day history
- [ ] **Verify**: Export option available
- [ ] **Verify**: Detailed conversion metrics
- [ ] **Verify**: ROI calculations

#### 6. Team Access (if implemented)
- [ ] Go to "Team" settings
- [ ] **Verify**: Can invite team members
- [ ] **Verify**: Role management available
- [ ] Add team member email
- [ ] **Verify**: Invitation sent

#### 7. Custom Branding
- [ ] Upload business logo
- [ ] Set brand colors
- [ ] **Verify**: Branding applies to listings
- [ ] **Verify**: Professional appearance

### Success Criteria
✅ Full profile customization  
✅ 20 images per listing (Business)  
✅ 60-day expiration  
✅ Bulk operations work  
✅ Advanced analytics available  
✅ Team features functional  
✅ Custom branding applies

---

# 📋 GENERAL TESTING CHECKLIST

## Cross-Feature Testing

### Mobile Responsiveness
- [ ] Test on mobile device (or DevTools mobile view)
- [ ] **Verify**: Bottom navigation displays
- [ ] **Verify**: Touch targets are large enough
- [ ] **Verify**: Images load optimized for mobile
- [ ] **Verify**: Forms are easy to fill

### Performance
- [ ] Check page load times
- [ ] **Verify**: Images lazy load
- [ ] **Verify**: CDN URLs used
- [ ] **Verify**: No console errors
- [ ] **Verify**: Smooth animations

### Analytics Tracking
- [ ] View a listing
- [ ] **Verify**: View count increments
- [ ] Click WhatsApp button
- [ ] **Verify**: Click tracked
- [ ] Share listing
- [ ] **Verify**: Share tracked

### Search and Filter
- [ ] Search for keyword
- [ ] **Verify**: Results relevant
- [ ] Apply category filter
- [ ] **Verify**: Filters work
- [ ] Apply price range
- [ ] **Verify**: Range respected

### Notifications
- [ ] Check for expiration warnings
- [ ] **Verify**: Warnings display at right time
- [ ] Check upgrade prompts
- [ ] **Verify**: Contextual and helpful

---

# 🐛 COMMON ISSUES TO WATCH FOR

## Free Tier
- ❌ Watermarks not applying
- ❌ Limit counters incorrect
- ❌ Can create more than 3 listings
- ❌ Images not expiring after 7 days
- ❌ Upgrade prompts not showing

## Premium Tier
- ❌ Watermarks still applying
- ❌ Limits not updated after upgrade
- ❌ Payment not processing
- ❌ Verified badge not showing
- ❌ Advanced galleries locked

## General
- ❌ Images not loading
- ❌ Analytics not tracking
- ❌ Search not working
- ❌ Mobile view broken
- ❌ Console errors

---

# ✅ FINAL VERIFICATION

After completing all walkthroughs:

- [ ] All 6 scenarios completed
- [ ] No critical bugs found
- [ ] All tier limits enforced correctly
- [ ] Payment flow works
- [ ] Analytics tracking accurate
- [ ] Mobile experience good
- [ ] Performance acceptable
- [ ] Ready for production

---

**Testing Date**: _____________  
**Tester Name**: _____________  
**Platform Version**: _____________  
**Notes**: _____________________________________________
