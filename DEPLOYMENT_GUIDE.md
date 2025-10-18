# Sellr - Deployment Guide 🚀

## Quick Deploy to Vercel (Recommended)

### **Step 1: Push to GitHub** ✅
Already done! Code is pushed to: `https://github.com/coastlinevibe/a2z.git`

### **Step 2: Deploy to Vercel**

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select `coastlinevibe/a2z` repository
   - Click "Import"

3. **Configure Environment Variables**
   
   Add these in Vercel dashboard:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SELLR_BASE_URL=https://your-app.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your live URL: `https://your-app.vercel.app`

---

## Environment Variables Setup

### **Get Supabase Credentials**

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### **Set Base URL**

After first deployment, update:
```
NEXT_PUBLIC_SELLR_BASE_URL=https://your-actual-vercel-url.vercel.app
```

---

## Local Testing Before Deploy

### **1. Create .env.local file**

```bash
# In project root
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SELLR_BASE_URL=http://localhost:3000
```

### **2. Run Development Server**

```bash
npm install
npm run dev
```

Open: http://localhost:3000

### **3. Test Share Link Locally**

1. Create a listing
2. Share link will be: `http://localhost:3000/p/[slug]`
3. Open in new tab to test
4. WhatsApp link will work but use localhost URL

---

## Post-Deployment Testing

### **Test 1: Create & Share Listing**

1. Go to your live URL
2. Sign up / Login
3. Create listing with 4 images
4. Click "Share"
5. Copy link - should be: `https://your-app.vercel.app/p/[slug]`
6. Open link in incognito window
7. Verify listing displays correctly

### **Test 2: WhatsApp Integration**

1. Open public listing page
2. Click "Contact Seller"
3. Verify WhatsApp opens with:
   - Correct phone number
   - Pre-filled message with listing title, price, and link

### **Test 3: Analytics Tracking**

1. Open listing in incognito (counts as view)
2. Click "Contact Seller" (counts as click)
3. Go to dashboard
4. Verify views and clicks increased

---

## Supabase Storage Setup

### **Enable Storage for Images**

1. Go to Supabase Dashboard → Storage
2. Create bucket: `listing-images`
3. Set bucket to **Public**
4. Add policy:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'listing-images' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.role() = 'authenticated'
);
```

---

## Database Migrations

### **Run Migrations**

If you haven't run the migrations yet:

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file:

```sql
-- From: supabase/migrations/add_display_type.sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS display_type TEXT DEFAULT 'hover';

-- From: supabase/migrations/add_media_descriptions.sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_descriptions TEXT[];
```

---

## Custom Domain (Optional)

### **Add Custom Domain to Vercel**

1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain: `sellr.co.za`
4. Follow DNS setup instructions
5. Update env variable:
   ```
   NEXT_PUBLIC_SELLR_BASE_URL=https://sellr.co.za
   ```

---

## Troubleshooting

### **Issue: Share link shows localhost**
**Fix:** Update `NEXT_PUBLIC_SELLR_BASE_URL` in Vercel env variables

### **Issue: Images not uploading**
**Fix:** Check Supabase Storage bucket is created and public

### **Issue: WhatsApp not opening**
**Fix:** Verify phone number format in listing (include country code)

### **Issue: Analytics not tracking**
**Fix:** Check Supabase RLS policies allow anonymous reads on posts table

### **Issue: 404 on public listing page**
**Fix:** Verify slug is generated correctly and listing is active

---

## Production Checklist

Before going live:

- [ ] Environment variables set in Vercel
- [ ] Supabase Storage bucket created
- [ ] Database migrations run
- [ ] Test create listing flow
- [ ] Test share link works
- [ ] Test WhatsApp integration
- [ ] Test on mobile device
- [ ] Test analytics tracking
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)

---

## Quick Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint code
npm run lint
```

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Check Supabase logs
4. Verify environment variables are set correctly

---

**Your app is ready to deploy! 🎉**

Next URL after deploy: `https://your-app.vercel.app`
