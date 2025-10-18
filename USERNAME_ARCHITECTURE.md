# Username-Based URL Architecture 🏗️

## Overview

Changed from generic listing URLs to user-specific URLs for better branding and discoverability.

---

## URL Structure

### **Old (Generic):**
```
https://a2z-1fmu.vercel.app/p/hover
```

### **New (User-Specific):**
```
https://a2z-1fmu.vercel.app/riegaldutoit/hover
https://a2z-1fmu.vercel.app/[username]/[slug]
```

---

## New Routes

### **1. User Profile Page**
**URL:** `https://a2z-1fmu.vercel.app/[username]`

**Example:** `https://a2z-1fmu.vercel.app/riegaldutoit`

**Shows:**
- User's display name and bio
- User's avatar
- All active listings from that user
- Grid layout of listings

### **2. User Listing Page**
**URL:** `https://a2z-1fmu.vercel.app/[username]/[slug]`

**Example:** `https://a2z-1fmu.vercel.app/riegaldutoit/hover`

**Shows:**
- Full listing details
- Gallery with all images
- Contact seller button
- Share options
- Breadcrumb back to user's profile

---

## Database Changes

### **New Table: `profiles`**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### **Updated Table: `posts`**
```sql
ALTER TABLE posts ADD COLUMN username TEXT;
```

---

## Implementation Steps

### **Step 1: Run Database Migration**

Go to Supabase Dashboard → SQL Editor → Run:

```sql
-- Copy contents from:
supabase/migrations/add_username_to_users.sql
```

This creates:
- `profiles` table
- Auto-trigger to create profile on signup
- Username field on posts

### **Step 2: Create Your Username**

After migration, manually create your profile:

```sql
INSERT INTO profiles (id, username, display_name)
VALUES (
  'your-user-id-here',
  'riegaldutoit',
  'Riegal du Toit'
);
```

To find your user ID:
```sql
SELECT id, email FROM auth.users;
```

### **Step 3: Update Existing Posts**

Add username to your existing posts:

```sql
UPDATE posts
SET username = 'riegaldutoit'
WHERE owner = 'your-user-id-here';
```

### **Step 4: Deploy**

The new routes are already created:
- `/app/[username]/page.tsx` - User profile
- `/app/[username]/[slug]/page.tsx` - User listing
- `ShareModal.tsx` - Updated to use new URLs

---

## How It Works

### **Creating a Listing:**
1. User creates listing in dashboard
2. System generates slug from title
3. System adds user's username to post
4. Share link becomes: `/{username}/{slug}`

### **Sharing a Listing:**
1. Click "Share" button
2. ShareModal generates URL: `/{username}/{slug}`
3. Copy link or share to WhatsApp/social media
4. Anyone can view at that URL

### **Viewing a Listing:**
1. Visitor opens: `/riegaldutoit/hover`
2. System looks up user "riegaldutoit"
3. System finds post with slug "hover" by that user
4. Displays listing page
5. Breadcrumb links back to `/riegaldutoit` profile

---

## Benefits

### **For Sellers:**
✅ **Personal branding** - Your username in every link
✅ **Profile page** - Showcase all your listings
✅ **Professional look** - Like Instagram/Twitter
✅ **Easy to remember** - `sellr.com/yourname`

### **For Buyers:**
✅ **Trust** - See who's selling
✅ **Discover more** - Click username to see all listings
✅ **Context** - Know who you're buying from

---

## Examples

### **Riegal du Toit's Profile:**
```
URL: https://a2z-1fmu.vercel.app/riegaldutoit

Shows:
- Display name: "Riegal du Toit"
- Username: @riegaldutoit
- All active listings (gallll, hover, vertiiiii, etc.)
```

### **Specific Listing:**
```
URL: https://a2z-1fmu.vercel.app/riegaldutoit/hover

Shows:
- The "hover" listing
- Owned by @riegaldutoit
- Breadcrumb: "← Back to @riegaldutoit's profile"
```

---

## Migration Checklist

- [ ] Run database migration (create profiles table)
- [ ] Create your profile with username
- [ ] Update existing posts with username
- [ ] Test profile page: `/riegaldutoit`
- [ ] Test listing page: `/riegaldutoit/hover`
- [ ] Test share link generation
- [ ] Deploy to Vercel

---

## Next Steps

1. **Run the migration** in Supabase
2. **Set your username** (riegaldutoit)
3. **Update existing posts** with username
4. **Push and deploy** the code
5. **Test** the new URLs

---

## Future Enhancements

- Custom domains per user (e.g., `riegaldutoit.sellr.com`)
- Verified badges for profiles
- Profile customization (colors, themes)
- Follow/subscribe to users
- User analytics (profile views)

---

**Your new share links will be:**
```
https://a2z-1fmu.vercel.app/riegaldutoit/hover
https://a2z-1fmu.vercel.app/riegaldutoit/gallll
https://a2z-1fmu.vercel.app/riegaldutoit/vertiiiii
```

Much better than generic `/p/` URLs! 🎉
