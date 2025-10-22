# A2Z Free Plan Deployment Checklist

## 🔧 **Environment Setup**

### **Local Development**
- [ ] Add `CRON_SECRET=urhq42oLA2noHnsF8D7a66RTUggN3j6` to `.env.local`
- [ ] Verify Supabase connection working
- [ ] Test app starts without errors: `npm run dev`

### **Production Deployment**
- [ ] Add `CRON_SECRET` to Vercel/deployment environment variables
- [ ] Verify all Supabase environment variables set
- [ ] Deploy and test app loads correctly

## 🗄️ **Database Verification**

### **Required Tables & Columns**
- [ ] `profiles` table has `last_free_reset` column
- [ ] `profiles` table has `current_listings` column  
- [ ] `check_user_tier_limits()` function exists
- [ ] Storage bucket 'posts' configured with 10MB limit

### **Test Data**
- [ ] At least 1 free user exists for testing
- [ ] Test user has some posts to verify reset works
- [ ] Verify tier limits function returns correct data

## 🧪 **Functionality Testing**

### **Free User Journey**
- [ ] Sign up process works (animated signup page)
- [ ] Dashboard loads with free account notifications
- [ ] Can create listing with 5 images max
- [ ] Gallery types work (Hover, Horizontal, Vertical, Gallery)
- [ ] Tier limits enforced (3 listings max)
- [ ] Profile dropdown shows "Free" badge
- [ ] Upgrade prompts appear when limits hit

### **Reset System**
- [ ] Manual reset endpoint works: `GET /api/cron/free-account-reset`
- [ ] Reset notifications appear on dashboard
- [ ] Reset actually deletes posts but preserves profile
- [ ] Post-reset user can create new listings

### **File Upload System**
- [ ] 5 image limit enforced per listing
- [ ] 10MB file size limit enforced
- [ ] Supported file types work (JPG, PNG, WEBP, etc.)
- [ ] Upload progress shows correctly
- [ ] Error handling for invalid files

## 🤖 **Automation Setup**

### **GitHub Actions**
- [ ] `.github/workflows/free-account-reset.yml` exists
- [ ] GitHub repo secrets configured:
  - [ ] `VERCEL_URL` = your production URL
  - [ ] `CRON_SECRET` = your generated secret
- [ ] Workflow runs successfully (test manually first)

### **Alternative Cron Options**
If not using GitHub Actions:
- [ ] Vercel Cron configured (if using Vercel)
- [ ] External cron service set up (cron-job.org, etc.)
- [ ] Cron service has correct URL and secret

## 🔐 **Security Checklist**

### **API Security**
- [ ] CRON_SECRET is secure (32+ characters)
- [ ] Secret not committed to code
- [ ] Reset endpoint requires authentication
- [ ] Manual test endpoint disabled in production

### **Database Security**
- [ ] RLS policies active on posts table
- [ ] User can only see/edit their own posts
- [ ] Tier limits properly enforced server-side

## 📊 **Monitoring Setup**

### **Logging**
- [ ] Reset job logs success/failure
- [ ] File upload errors logged
- [ ] Tier limit violations logged
- [ ] Database errors logged

### **Analytics**
- [ ] Track free user signups
- [ ] Track reset completion rates
- [ ] Track upgrade conversions from reset prompts
- [ ] Monitor file upload success rates

## 🎯 **Beta Testing Preparation**

### **Test User Setup**
- [ ] Create 5-10 test accounts with different states:
  - [ ] Brand new free user (Day 1)
  - [ ] Free user near reset (Day 6)
  - [ ] Free user post-reset (Day 8)
  - [ ] Free user at listing limit (3/3)
  - [ ] Free user with various gallery types

### **Documentation**
- [ ] Beta testing guide updated with real URLs
- [ ] Known issues documented
- [ ] Support contact information provided
- [ ] Feedback collection method set up

## 🚀 **Go-Live Checklist**

### **Final Verification**
- [ ] All tests pass in production environment
- [ ] Reset automation working correctly
- [ ] No critical bugs in user journey
- [ ] Performance acceptable under load
- [ ] Mobile experience tested

### **Rollback Plan**
- [ ] Database backup taken before go-live
- [ ] Previous version deployment ready
- [ ] Rollback procedure documented
- [ ] Team knows how to execute rollback

## 📝 **Post-Launch Monitoring**

### **First 24 Hours**
- [ ] Monitor reset job execution
- [ ] Check error rates in logs
- [ ] Verify user signups working
- [ ] Monitor file upload success
- [ ] Check database performance

### **First Week**
- [ ] Collect beta tester feedback
- [ ] Monitor conversion rates
- [ ] Track reset cycle completion
- [ ] Identify common user issues
- [ ] Plan improvements based on feedback

---

## ✅ **Sign-Off**

**Technical Lead**: _________________ Date: _______

**QA Lead**: _________________ Date: _______

**Product Owner**: _________________ Date: _______

---

**🎉 Ready for Beta Testing when all items checked!**
