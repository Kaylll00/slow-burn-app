-- ============================================
-- Slow Burn App - Row Level Security Policies
-- ============================================
-- Run this SQL in your Supabase SQL Editor to enable RLS
-- These policies ensure users can only access their own data
-- ============================================

-- Enable Row Level Security on all tables
ALTER TABLE wants ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for initial creation)
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
USING (auth.uid() = id);

-- ============================================
-- WANTS TABLE POLICIES
-- ============================================

-- Users can view their own wants
CREATE POLICY "Users can view own wants"
ON wants
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own wants
CREATE POLICY "Users can insert own wants"
ON wants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own wants
CREATE POLICY "Users can update own wants"
ON wants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own wants
CREATE POLICY "Users can delete own wants"
ON wants
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- SAVINGS_LOG TABLE POLICIES
-- ============================================

-- Users can view their own savings log
CREATE POLICY "Users can view own savings log"
ON savings_log
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own savings log entries
CREATE POLICY "Users can insert own savings log"
ON savings_log
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own savings log entries
CREATE POLICY "Users can delete own savings log"
ON savings_log
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- STORAGE POLICIES (for want-images bucket)
-- ============================================

-- Allow users to upload images to their own folder
CREATE POLICY "Users can upload own images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'want-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own images
CREATE POLICY "Users can view own images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'want-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'want-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'want-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries to verify RLS is working correctly

-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('wants', 'savings_log', 'profiles');

-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- 1. These policies assume your tables have the correct structure:
--    - profiles: id (uuid, primary key, matches auth.uid())
--    - wants: user_id (uuid, references auth.users)
--    - savings_log: user_id (uuid, references auth.users)
--
-- 2. Make sure your Supabase storage bucket 'want-images' exists
--
-- 3. Test these policies by:
--    - Creating two test users
--    - Logging in as user 1 and creating some data
--    - Logging in as user 2 and verifying they cannot see user 1's data
--
-- 4. If you have existing data, you may need to update the user_id
--    fields to match the correct auth.uid() values
--
-- 5. Consider adding a trigger to automatically create a profile
--    when a new user signs up (optional but recommended)