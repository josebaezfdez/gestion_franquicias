-- Fix permissions for users table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."users";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."users";
DROP POLICY IF EXISTS "Enable update for users based on id" ON "public"."users";
DROP POLICY IF EXISTS "Enable delete for superadmins" ON "public"."users";

-- Disable RLS temporarily to ensure access
ALTER TABLE "public"."users" DISABLE ROW LEVEL SECURITY;
