# 🚀 Copy-Paste Setup Guide (5 Minutes Total!)

## You only need to do 3 copy-paste actions in Supabase. That's it!

---

## ✅ STEP 1: Database Migration (2 minutes)

### 📍 Where to go:
1. Open: https://supabase.com/dashboard/project/kteeflfqynvlupnstmdc/sql/new
2. This opens the SQL Editor directly!

### 📋 What to copy-paste:

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

### ▶️ What to do:
1. Click the link above
2. Paste the SQL code
3. Click "Run" button (bottom right)
4. ✅ Done! You should see "Success"

---

## ✅ STEP 2: Enable Rate Limiting (1 minute)

### 📍 Where to go:
1. Open: https://supabase.com/dashboard/project/kteeflfqynvlupnstmdc/settings/api

### ▶️ What to do:
1. Scroll down to "Rate Limiting" section
2. Toggle it ON
3. Click "Save"
4. ✅ Done!

**Note:** If you don't see this option, skip it - it might require a paid plan.

---

## ✅ STEP 3: Enable Email Verification (2 minutes)

### 📍 Where to go:
1. Open: https://supabase.com/dashboard/project/kteeflfqynvlupnstmdc/auth/settings

### ▶️ What to do:
1. Find "Enable email confirmations" toggle
2. Turn it ON
3. Scroll down and click "Save"
4. ✅ Done!

---

## 🎉 That's It!

Total time: **5 minutes**  
Total clicks: **~10 clicks**  
Total copy-pastes: **1 SQL query**

---

## ✅ Quick Verification:

After you're done, test in your app:
1. Refresh FocusFlow
2. Click "Today's Goal"
3. Change to 5 hours
4. Save
5. Refresh page
6. Should show "0.0/5h" ✅

---

## 🚀 Then You're Ready to Deploy!

Once these 3 steps are done, your app is 100% production ready!


