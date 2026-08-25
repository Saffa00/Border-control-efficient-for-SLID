-- ==============================================================================
-- SECURE SUPABASE STORAGE POLICIES (Hardened against IDOR & Public Data Leakage)
-- Sierra Leone Immigration Management System (SLID)
-- ==============================================================================

-- 1. Remove obsolete or overpermissive policies
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users and staff to read documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to upload own files" ON storage.objects;

-- 2. INSERT Policy: Allow authenticated users to upload to passport-photos & visa-documents
CREATE POLICY "Allow users to upload own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('passport-photos', 'visa-documents')
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = auth.uid()
      AND users.role IN ('immigration_officer', 'visa_officer', 'admin')
    )
  )
);

-- 3. SELECT Policy: Restrict reading to document owner OR authorized immigration staff/admin
CREATE POLICY "Allow users and staff to read documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('passport-photos', 'visa-documents')
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = auth.uid()
      AND users.role IN ('immigration_officer', 'visa_officer', 'admin')
    )
  )
);

-- 4. UPDATE Policy: Users can only update their own files
CREATE POLICY "Allow users to update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('passport-photos', 'visa-documents')
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id IN ('passport-photos', 'visa-documents')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. DELETE Policy: Users can only delete their own files, or admins
CREATE POLICY "Allow users and admins to delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('passport-photos', 'visa-documents')
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.user_id = auth.uid()
      AND users.role = 'admin'
    )
  )
);
