-- ==============================================================================
-- STAFF ACCESS REQUESTS TABLE & RLS POLICIES
-- Sierra Leone Immigration Management System (SLID)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.staff_access_requests (
  request_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name           VARCHAR(120) NOT NULL,
  email               VARCHAR(150) NOT NULL,
  phone               VARCHAR(30),
  requested_role      VARCHAR(50) NOT NULL DEFAULT 'immigration_officer', -- 'immigration_officer' | 'visa_officer'
  rank_title          VARCHAR(100),
  department          VARCHAR(100),
  duty_station        VARCHAR(100),
  checkpoint_id       UUID REFERENCES public.checkpoints(checkpoint_id) ON DELETE SET NULL,
  badge_number        VARCHAR(50),
  reason              TEXT,
  status              VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  rejection_reason    TEXT,
  reviewed_by         UUID REFERENCES public.users(user_id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at         TIMESTAMPTZ
);

-- Index for quick lookup of pending applications
CREATE INDEX IF NOT EXISTS idx_staff_requests_status ON public.staff_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_staff_requests_email ON public.staff_access_requests(email);

-- Enable Row Level Security
ALTER TABLE public.staff_access_requests ENABLE ROW LEVEL SECURITY;

-- 1. Anyone (public prospective officers) can submit an access request
DROP POLICY IF EXISTS "Allow public to submit staff access requests" ON public.staff_access_requests;
CREATE POLICY "Allow public to submit staff access requests"
ON public.staff_access_requests
FOR INSERT
TO public
WITH CHECK (true);

-- 2. Authenticated Admins and Staff can view staff requests
DROP POLICY IF EXISTS "Allow admins and staff to view access requests" ON public.staff_access_requests;
CREATE POLICY "Allow admins and staff to view access requests"
ON public.staff_access_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.user_id = auth.uid()
    AND users.role = 'admin'
  )
);

-- 3. Admins can update access requests (approve / reject)
DROP POLICY IF EXISTS "Allow admins to update access requests" ON public.staff_access_requests;
CREATE POLICY "Allow admins to update access requests"
ON public.staff_access_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.user_id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.user_id = auth.uid()
    AND users.role = 'admin'
  )
);
