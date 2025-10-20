# Watermark System - A2Z Platform

## Overview
Automatic watermark system that adds "A2Z.co.za" branding to images uploaded by free tier users. Premium and Business users upload without watermarks.

## ✅ Implemented Features

### 1. Automatic Watermarking
- **Free Tier**: All images get watermarked
- **Premium/Business**: No watermarks
- **Position**: Bottom-right corner (configurable)
- **Style**: White text with shadow, 50-60% opacity

### 2. Client-Side Watermarking
```typescript
import { addWatermark, shouldApplyWatermark } from '@/lib/watermark/generator'

// Check if watermark needed
if (shouldApplyWatermark(userTier)) {
  const watermarkedBlob = await addWatermark(imageFile, {
    text: 'A2Z.co.za',
    position: 'bottom-right',
    opacity: 0.6,
    fontSize: 24,
    padding: 20
  })
}
```

### 3. Server-Side Watermarking
```typescript
import { addWatermarkServer } from '@/lib/watermark/server'

const watermarkedBuffer = await addWatermarkServer(imageBuffer, {
  text: 'A2Z.co.za',
  position: 'bottom-right',
  opacity: 0.6,
  fontSize: 48,
  padding: 40
})
```

### 4. Database Tracking
```sql
media_files table:
- has_watermark (BOOLEAN) - Tracks if image has watermark
- watermark_applied_at (TIMESTAMPTZ) - When watermark was added
- original_url (TEXT) - Original image URL (for upgrade)
```

### 5. API Endpoints

#### Apply Watermark
**POST** `/api/watermark/apply`
```typescript
const formData = new FormData()
formData.append('file', imageFile)
formData.append('user_id', userId)
formData.append('position', 'bottom-right')

const response = await fetch('/api/watermark/apply', {
  method: 'POST',
  body: formData
})
```

#### Check Watermark Status
**GET** `/api/watermark/apply?user_id=uuid`
```json
{
  "should_watermark": true,
  "tier": "free",
  "watermark_text": "A2Z.co.za"
}
```

### 6. UI Components

#### WatermarkPreview
Shows warning to free users:
```tsx
import { WatermarkPreview } from '@/components/WatermarkPreview'

<WatermarkPreview 
  subscriptionTier={userTier}
  showWarning={true}
/>
```

#### WatermarkStatus
Shows watermark status badge:
```tsx
import { WatermarkStatus } from '@/components/WatermarkPreview'

<WatermarkStatus subscriptionTier={userTier} />
```

#### WatermarkUpgradePrompt
Encourages upgrade to remove watermarks:
```tsx
import { WatermarkUpgradePrompt } from '@/components/WatermarkPreview'

<WatermarkUpgradePrompt />
```

## 🎨 Watermark Styles

### Default Style
- **Text**: "A2Z.co.za"
- **Font**: Bold Arial, 48px (server) / 24px (client)
- **Color**: White (#ffffff)
- **Opacity**: 50-60%
- **Shadow**: Black shadow for visibility
- **Position**: Bottom-right corner
- **Padding**: 40px from edges

### Position Options
- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`
- `center`
- `diagonal` (client-side only)

### Customization
```typescript
const options = {
  text: 'A2Z.co.za',
  position: 'bottom-right',
  opacity: 0.6,
  fontSize: 48,
  color: '#ffffff',
  padding: 40
}
```

## 🔄 Upgrade Flow

### When User Upgrades to Premium

1. **Mark Images for Removal**
```sql
SELECT mark_images_for_watermark_removal('user-id');
```

2. **Options for User**:
   - **Option A**: Re-upload images without watermark
   - **Option B**: Keep existing watermarked images
   - **Option C**: Automatic removal (requires original images)

3. **Notification**
```
"You've upgraded! Your new images won't have watermarks. 
Would you like to re-upload your existing images?"
```

## 📊 Database Functions

### Check if User Needs Watermarks
```sql
SELECT should_apply_watermark('user-id');
-- Returns: true (free tier) or false (premium/business)
```

### Mark Images for Removal
```sql
SELECT mark_images_for_watermark_removal('user-id');
-- Returns: count of images marked
```

### Query Watermarked Images
```sql
SELECT * FROM media_files 
WHERE has_watermark = TRUE 
AND post_id IN (
  SELECT id FROM posts WHERE owner = 'user-id'
);
```

## 🔧 Implementation Guide

### Step 1: Upload Flow Integration

```typescript
// In your image upload component
import { addWatermark, shouldApplyWatermark } from '@/lib/watermark/generator'

async function handleImageUpload(file: File, userId: string, userTier: string) {
  let finalFile = file
  
  // Apply watermark if needed
  if (shouldApplyWatermark(userTier)) {
    const watermarkedBlob = await addWatermark(file, {
      text: 'A2Z.co.za',
      position: 'bottom-right',
      opacity: 0.6
    })
    finalFile = new File([watermarkedBlob], file.name, { type: file.type })
  }
  
  // Upload to storage
  const { data, error } = await supabase.storage
    .from('images')
    .upload(`${userId}/${Date.now()}_${file.name}`, finalFile)
  
  // Save to database with watermark flag
  await supabase.from('media_files').insert({
    post_id: postId,
    url: data.path,
    has_watermark: shouldApplyWatermark(userTier),
    watermark_applied_at: shouldApplyWatermark(userTier) ? new Date() : null
  })
}
```

### Step 2: Display Watermark Warning

```tsx
// In CreatePostForm or ImageUploader
import { WatermarkPreview } from '@/components/WatermarkPreview'

function ImageUploader({ userTier }) {
  return (
    <div>
      <WatermarkPreview subscriptionTier={userTier} />
      
      {/* Your upload UI */}
      <input type="file" ... />
    </div>
  )
}
```

### Step 3: Handle Upgrades

```typescript
// When user upgrades subscription
async function handleSubscriptionUpgrade(userId: string) {
  // Mark images for removal
  const { data } = await supabase.rpc('mark_images_for_watermark_removal', {
    user_id_param: userId
  })
  
  // Notify user
  showNotification({
    title: 'Watermarks Removed!',
    message: `${data} images marked. New uploads won't have watermarks.`
  })
}
```

## 🎯 Use Cases

### Free Tier User
1. Uploads image
2. Watermark automatically applied
3. Image stored with `has_watermark = true`
4. Watermark visible on listing

### Premium User
1. Uploads image
2. No watermark applied
3. Image stored with `has_watermark = false`
4. Clean, professional listing

### User Upgrades
1. Existing images keep watermark
2. New uploads have no watermark
3. Option to re-upload old images
4. Database tracks watermark status

## 🔐 Security & Quality

### Image Quality
- **Compression**: 85% JPEG quality
- **Format**: Maintains original format
- **Size**: No resize during watermarking
- **Metadata**: Preserves EXIF data

### Performance
- **Client-side**: Canvas API (fast, no server load)
- **Server-side**: Sharp library (optimized)
- **Async**: Non-blocking processing
- **Fallback**: Original image if watermarking fails

### Privacy
- **No tracking**: Watermark is visual only
- **No metadata**: No hidden data added
- **Reversible**: Can be removed on upgrade

## 📱 Mobile Support

### Responsive Watermarks
- Scales with image size
- Readable on all devices
- Maintains aspect ratio
- Touch-friendly UI

### Performance
- Optimized for mobile browsers
- Progressive loading
- Minimal memory usage

## 🚀 Future Enhancements

### Planned Features
1. **Custom Watermarks** (Business tier)
   - Upload own logo
   - Custom text
   - Brand colors

2. **Watermark Positions**
   - Multiple positions
   - Tiled watermarks
   - Corner badges

3. **Automatic Removal**
   - Store original images
   - Remove on upgrade
   - Batch processing

4. **Advanced Styles**
   - Gradient watermarks
   - Transparent logos
   - Animated watermarks (GIF)

5. **Bulk Operations**
   - Batch watermark
   - Batch removal
   - Re-watermark all

## 🐛 Troubleshooting

### Watermark Not Appearing
1. Check user subscription tier
2. Verify `shouldApplyWatermark()` returns true
3. Check browser console for errors
4. Ensure canvas API is supported

### Image Quality Issues
1. Adjust compression quality
2. Check original image size
3. Verify watermark opacity
4. Test different positions

### Performance Problems
1. Use server-side for large images
2. Batch process multiple images
3. Optimize image size first
4. Use web workers for client-side

## 📊 Analytics

### Track Watermark Usage
```sql
-- Count watermarked images
SELECT COUNT(*) FROM media_files WHERE has_watermark = TRUE;

-- Watermarks by user tier
SELECT p.subscription_tier, COUNT(m.id) as watermarked_count
FROM media_files m
JOIN posts po ON m.post_id = po.id
JOIN profiles p ON po.owner = p.id
WHERE m.has_watermark = TRUE
GROUP BY p.subscription_tier;

-- Recent watermarks
SELECT * FROM media_files 
WHERE has_watermark = TRUE 
ORDER BY watermark_applied_at DESC 
LIMIT 10;
```

## 💡 Best Practices

1. **Always check tier before watermarking**
2. **Store original URLs for premium upgrades**
3. **Use server-side for production**
4. **Show clear warnings to free users**
5. **Make upgrade path obvious**
6. **Test on various image sizes**
7. **Handle errors gracefully**
8. **Monitor watermark quality**

---

**Status:** ✅ Production Ready  
**Last Updated:** 2025-10-20  
**Version:** 1.0.0
