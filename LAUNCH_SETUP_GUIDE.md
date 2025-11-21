# 🚀 FocusFlow - Launch Setup Guide

## Complete These 3 Steps Before Going Live

---

## ✅ Step 1: Run Database Migration (REQUIRED)

### What This Does:
Adds the `daily_goal` column to your profiles table so users can set their daily study goals.

### How to Do It:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project: `kteeflfqynvlupnstmdc`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste This SQL:**

```sql
-- Add daily_goal column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 240;

-- Update any existing profiles to have the default daily goal
UPDATE profiles 
SET daily_goal = 240 
WHERE daily_goal IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN profiles.daily_goal IS 'Daily study goal in minutes (default: 240 = 4 hours)';
```

4. **Click "Run" (or press Ctrl+Enter)**

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - This is normal and means it worked!

6. **Verify the Column Exists**
   - Run this query to check:
   ```sql
   SELECT id, email, daily_goal FROM profiles LIMIT 5;
   ```
   - You should see the `daily_goal` column with value `240`

### ✅ Done! 
Your database now supports daily goals.

---

## ✅ Step 2: Enable Rate Limiting (RECOMMENDED)

### What This Does:
Prevents abuse, spam, and DDoS attacks by limiting how many requests users can make.

### How to Do It:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project: `kteeflfqynvlupnstmdc`

2. **Navigate to API Settings**
   - Click "Settings" in the left sidebar
   - Click "API" under Settings

3. **Scroll to "Rate Limiting" Section**
   - Look for "Rate Limiting" or "API Rate Limits"

4. **Enable Rate Limiting**
   - Toggle "Enable Rate Limiting" to ON

5. **Configure Limits (Recommended Values):**

   **For Authentication Endpoints:**
   - Sign up: `10 requests per minute`
   - Sign in: `10 requests per minute`
   - Password reset: `5 requests per minute`

   **For Database Queries:**
   - Per user: `100 requests per minute`
   - Per IP: `200 requests per minute`

   **For API Endpoints:**
   - General: `50 requests per minute`

6. **Save Changes**
   - Click "Save" or "Update"

### ✅ Done!
Your app is now protected from abuse.

---

## ✅ Step 3: Enable Email Verification (RECOMMENDED)

### What This Does:
Requires users to verify their email before they can use the app. Prevents fake accounts and spam.

### How to Do It:

1. **Go to Supabase Dashboard**
   - Open: https://supabase.com/dashboard
   - Select your project: `kteeflfqynvlupnstmdc`

2. **Navigate to Authentication Settings**
   - Click "Authentication" in the left sidebar
   - Click "Settings" under Authentication

3. **Enable Email Confirmation**
   - Scroll to "Email Confirmation"
   - Toggle "Enable email confirmations" to ON

4. **Configure Email Settings**
   - **Confirm email:** ON
   - **Double confirm email change:** ON (recommended)
   - **Secure email change:** ON (recommended)

5. **Customize Email Templates (Optional)**
   - Click "Email Templates" in the left sidebar
   - Customize the "Confirm signup" email template
   - You can add your app name, logo, and custom message

   **Example Template:**
   ```html
   <h2>Welcome to FocusFlow!</h2>
   <p>Thanks for signing up! Please confirm your email address by clicking the link below:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
   <p>If you didn't sign up for FocusFlow, you can safely ignore this email.</p>
   ```

6. **Set Redirect URL**
   - In "URL Configuration" section
   - Set "Site URL" to your production domain (e.g., `https://focusflow.vercel.app`)
   - Set "Redirect URLs" to include your domain

7. **Save Changes**
   - Click "Save"

### ✅ Done!
Users will now need to verify their email before accessing the app.

---

## 🎯 Verification Checklist

After completing all 3 steps, verify everything works:

### Test Step 1 (Database Migration):
- [ ] Log into your app
- [ ] Go to "Today's Goal" card
- [ ] Change the daily goal to a different value
- [ ] Refresh the page
- [ ] Verify the new goal is displayed

### Test Step 2 (Rate Limiting):
- [ ] Check Supabase Dashboard → Settings → API
- [ ] Verify "Rate Limiting" is enabled
- [ ] Try making multiple rapid requests (optional)
- [ ] Should see rate limit errors if exceeded

### Test Step 3 (Email Verification):
- [ ] Sign out of your app
- [ ] Create a new test account
- [ ] Check your email for verification link
- [ ] Click the verification link
- [ ] Verify you can now access the app

---

## 🚨 Troubleshooting

### Step 1 Issues:

**Error: "column already exists"**
- This is fine! It means the column was already added.
- Just run the UPDATE query to set default values.

**Error: "permission denied"**
- Make sure you're logged into the correct Supabase project
- Check that you have admin access

### Step 2 Issues:

**Can't find Rate Limiting option**
- Rate limiting might be in a different location depending on your Supabase plan
- Check: Settings → API → Rate Limits
- Or: Project Settings → API Settings
- If not available, it might require a paid plan

### Step 3 Issues:

**Emails not sending**
- Check Supabase Dashboard → Authentication → Settings → SMTP
- Verify email provider is configured
- Check spam folder
- Try with a different email address

**Verification link doesn't work**
- Check "Site URL" is set correctly
- Verify "Redirect URLs" includes your domain
- Make sure HTTPS is enabled on your domain

---

## ✅ All Done!

Once you've completed all 3 steps and verified they work, you're ready to deploy to production!

**Next Steps:**
1. Review `PRODUCTION_CHECKLIST.md` for deployment steps
2. Deploy to Vercel or Netlify
3. Test everything on production
4. Launch! 🚀

---

## 📞 Need Help?

If you run into issues:
1. Check the troubleshooting section above
2. Review Supabase documentation: https://supabase.com/docs
3. Check Supabase status: https://status.supabase.com
4. Contact Supabase support (if needed)

**You've got this! 🎉**

