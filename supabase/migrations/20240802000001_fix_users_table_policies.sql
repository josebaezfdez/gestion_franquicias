-- Fix permissions for users table

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."users";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."users";
DROP POLICY IF EXISTS "Enable update for users based on id" ON "public"."users";
DROP POLICY IF EXISTS "Enable delete for superadmins" ON "public"."users";

-- Disable RLS temporarily to ensure access
ALTER TABLE "public"."users" DISABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON "public"."users"
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON "public"."users"
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for users based on id"
ON "public"."users"
FOR UPDATE
USING (auth.uid() = id OR auth.uid() IN (
  SELECT id FROM public.users WHERE role IN ('superadmin', 'admin')
));

CREATE POLICY "Enable delete for superadmins"
ON "public"."users"
FOR DELETE
USING (auth.uid() IN (
  SELECT id FROM public.users WHERE role = 'superadmin'
));
