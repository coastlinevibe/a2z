# Sellr - Testing Checklist 🧪

## 🎯 Core Functionality to Test

### **1. Share Link Feature (PRIORITY)**

#### **Test Flow:**
1. ✅ **Create a Listing**
   - Go to `/create`
   - Upload 4 images (test Premium gallery)
   - Add title, price, description
   - Add emoji tags
   - Add WhatsApp number
   - Set display type to "Premium"
   - Submit

2. ✅ **Access Dashboard**
   - Go to `/dashboard`
   - Verify listing appears
   - Check views = 0, clicks = 0

3. ✅ **Open Share Modal**
   - Click "Share" button on listing
   - Verify share modal opens
   - Check that public URL is generated: `https://yourdomain.com/p/[slug]`

4. ✅ **Copy Share Link**
   - Click "Copy Link" button
   - Verify "Copied!" confirmation appears
   - Paste link in notepad - should be full URL

5. ✅ **Test Public Page**
   - Click "View Public Page" button
   - Verify new tab opens with listing
   - Check that:
     - ✅ All 4 images display in Premium gallery
     - ✅ Title, price, description show correctly
     - ✅ Emoji tags display
     - ✅ "Contact Seller" button exists
     - ✅ Location shows (if added)

6. ✅ **Test WhatsApp Integration**
   - Click "Contact Seller" button
   - Verify WhatsApp opens (web or app)
   - Check pre-filled message includes:
     - Listing title
     - Price
     - Link to listing

7. ✅ **Test Share to Social Media**
   - In Share Modal, click WhatsApp icon
   - Verify WhatsApp share dialog opens
   - Test Facebook, Twitter, LinkedIn buttons
   - Verify each opens correct platform with pre-filled text

8. ✅ **Test Analytics Tracking**
   - Open public listing page in incognito/private window
   - Refresh page 3 times
   - Click "Contact Seller" button 2 times
   - Go back to Dashboard
   - Verify:
     - Views increased (should be 3+)
     - Clicks increased (should be 2+)

---

### **2. Gallery Layouts**

Test all 4 display types:

#### **Hover Gallery**
- Upload 4 images
- Set display type to "Hover"
- Verify: Hover over image shows next image

#### **Horizontal Slider**
- Upload 4 images
- Set display type to "Slider"
- Verify: Left/right arrows work, swipe works on mobile

#### **Vertical Slider**
- Upload 4 images
- Set display type to "Vertical"
- Verify: Up/down navigation works

#### **Premium Gallery**
- Upload 2 images → Check 2-image layout
- Upload 3 images → Check 3-image layout
- Upload 4 images → Check 4-image layout
- Upload 5 images → Check 5-image layout
- Upload 6+ images → Check 6+ image layout
- Click any image → Verify lightbox opens
- In lightbox:
  - ✅ Image displays full-screen
  - ✅ Left/right arrows work
  - ✅ Close button works
  - ✅ Image counter shows (e.g., "2 / 4")
  - ✅ Click outside closes lightbox

---

### **3. Dashboard Features**

#### **Grid View**
- Toggle to Grid view
- Verify 3D card effect on hover
- Click "view more" → Check expanded view appears
- Verify stats badges show (views/clicks)

#### **List View**
- Toggle to List view
- Verify thumbnail, title, price, tags display
- Check action buttons (Edit, Share, Delete)

#### **Analytics Cards**
- Check "Total Views" card updates
- Check "Total Clicks" card updates
- Check "Active Listings" count is correct

#### **Listing Management**
- Toggle listing active/inactive
- Edit listing → Verify changes save
- Delete listing → Verify confirmation modal
- Share listing → Verify share modal opens

---

### **4. Mobile Responsiveness**

Test on mobile device or DevTools mobile view:

- ✅ Home page displays correctly
- ✅ Create form is usable
- ✅ Dashboard cards stack properly
- ✅ Public listing page is readable
- ✅ Gallery swipe gestures work
- ✅ Share buttons are tappable
- ✅ WhatsApp button works on mobile

---

## 🐛 Known Issues to Check

### **Issue 1: Modal White Space**
- Open listing in dashboard
- Check if there's white space above gallery
- Should be fixed now (ListingCardGrid inline view)

### **Issue 2: Image Upload**
- Upload 8 images
- Verify all 8 upload successfully
- Check file size limits work

### **Issue 3: Slug Generation**
- Create listing with special characters in title
- Verify slug is URL-safe (no spaces, special chars)
- Check slug is unique

---

## 📱 Share Link Testing Scenarios

### **Scenario 1: WhatsApp Group Share**
1. Create listing
2. Copy share link
3. Paste in WhatsApp group
4. Click link from WhatsApp
5. Verify listing opens correctly
6. Click "Contact Seller"
7. Verify WhatsApp opens with seller's number

### **Scenario 2: Facebook Share**
1. Create listing
2. Click Facebook share button
3. Post to Facebook
4. Click link from Facebook post
5. Verify Open Graph meta tags show:
   - Listing image
   - Title + Price
   - Description

### **Scenario 3: Direct Link Share**
1. Copy listing URL manually
2. Send via SMS/Email
3. Open link on different device
4. Verify listing loads correctly

---

## ✅ Success Criteria

### **Share Link Must:**
- ✅ Generate unique URL for each listing
- ✅ Work when shared to WhatsApp groups
- ✅ Work when shared to social media
- ✅ Display listing correctly on all devices
- ✅ Track views when link is opened
- ✅ Track clicks when "Contact Seller" is clicked
- ✅ Open WhatsApp with pre-filled message
- ✅ Work in incognito/private mode (no login required)

### **Analytics Must:**
- ✅ Increment views on page load
- ✅ Increment clicks on WhatsApp button click
- ✅ Update dashboard in real-time
- ✅ Persist data in database

### **Gallery Must:**
- ✅ Display all uploaded images
- ✅ Support all 4 layout types
- ✅ Open lightbox on image click
- ✅ Navigate between images smoothly
- ✅ Work on mobile (swipe gestures)

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_SELLR_BASE_URL` env variable
- [ ] Test share links with production URL
- [ ] Verify Supabase connection works
- [ ] Check all images upload to Supabase Storage
- [ ] Test WhatsApp integration with real number
- [ ] Verify analytics tracking works
- [ ] Test on multiple devices (iOS, Android, Desktop)
- [ ] Check Open Graph meta tags render correctly
- [ ] Test in multiple browsers (Chrome, Safari, Firefox)

---

## 📝 Test Results Template

```
Date: ___________
Tester: ___________

Share Link Feature:
- [ ] Link generation works
- [ ] Public page loads
- [ ] WhatsApp integration works
- [ ] Analytics tracking works
- [ ] Social media sharing works

Gallery Layouts:
- [ ] Hover gallery works
- [ ] Slider gallery works
- [ ] Vertical gallery works
- [ ] Premium gallery works
- [ ] Lightbox works

Dashboard:
- [ ] Grid view works
- [ ] List view works
- [ ] Analytics update
- [ ] CRUD operations work

Mobile:
- [ ] Responsive design works
- [ ] Touch gestures work
- [ ] WhatsApp opens correctly

Issues Found:
1. ___________
2. ___________
3. ___________
```

---

## 🎯 Next Steps After Testing

Once share link is confirmed working:

1. **Implement Premium Tiers**
   - Free tier with 7-day image storage
   - Premium tier (R49/month)
   - Business tier (R179/month)

2. **Add Payment Integration**
   - Ozow for instant EFT
   - PayFast as backup
   - Airtime vouchers

3. **Build Upgrade Flow**
   - Pricing page
   - Checkout process
   - Subscription management

4. **Add Premium Features**
   - Verified badges
   - Advanced analytics
   - Custom branding
   - Bulk operations

---

**Ready to test! Deploy and share your first listing! 🚀**
