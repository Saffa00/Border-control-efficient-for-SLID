-- ============================================================
-- ADD APPLICANT PROFILE & ADDRESS & EMERGENCY CONTACT FIELDS
-- ============================================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS country_of_residence VARCHAR(100),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(120),
ADD COLUMN IF NOT EXISTS address_line TEXT,
ADD COLUMN IF NOT EXISTS address_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS address_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50);
