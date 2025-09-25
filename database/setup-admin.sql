-- Setup script to create your super admin account
-- Run this AFTER you've signed up through the normal auth flow

-- Step 1: Find your user ID from auth.users table
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';


-- Step 2: Replace the values below with your actual details and run
INSERT INTO user_profiles (
  user_id, 
  email, 
  full_name, 
  role, 
  status, 
  country,
  created_by, 
  approved_at
) VALUES (
  'YOUR_USER_ID_FROM_AUTH_USERS_TABLE', -- Replace with your actual user ID
  'your-email@example.com',              -- Replace with your email
  'Your Full Name',                      -- Replace with your name
  'super_admin',                         -- This gives you full access
  'active',                              -- Active status
  'Singapore',                           -- Your country
  'system@golfapp.com',                  -- System created
  NOW()                                  -- Approved now
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'super_admin',
  status = 'active',
  updated_at = NOW();

-- Verify the setup
SELECT * FROM user_profiles WHERE email = 'your-email@example.com';