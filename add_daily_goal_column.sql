-- Add daily_goal column to profiles table
-- This column stores the user's daily study goal in minutes
-- Default is 240 minutes (4 hours)

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 240;

-- Update any existing profiles to have the default daily goal
UPDATE profiles 
SET daily_goal = 240 
WHERE daily_goal IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN profiles.daily_goal IS 'Daily study goal in minutes (default: 240 = 4 hours)';

