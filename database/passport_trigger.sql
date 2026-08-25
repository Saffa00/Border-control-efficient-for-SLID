-- ==============================================================================
-- DATABASE TRIGGER: AUTO-GENERATE PASSPORT NUMBER
-- Sierra Leone Immigration Management System (SLID)
-- ==============================================================================
-- Run this in your Supabase SQL Editor to automatically generate official
-- passport numbers (e.g. SL-P0100001) whenever a passport is registered.

-- 1. Create sequence for sequential passport numbering
CREATE SEQUENCE IF NOT EXISTS public.passport_number_seq START WITH 100001;

-- 2. Create trigger function
CREATE OR REPLACE FUNCTION public.generate_passport_number()
RETURNS TRIGGER AS $$
BEGIN
  -- If passport_number is null, empty string, or starts with 'AUTO', generate standard SL-P format
  IF NEW.passport_number IS NULL OR trim(NEW.passport_number) = '' OR trim(NEW.passport_number) = 'AUTO' THEN
    NEW.passport_number := 'SL-P' || lpad(nextval('public.passport_number_seq')::text, 7, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger BEFORE INSERT on public.passports
DROP TRIGGER IF EXISTS trigger_generate_passport_number ON public.passports;
CREATE TRIGGER trigger_generate_passport_number
BEFORE INSERT ON public.passports
FOR EACH ROW
EXECUTE FUNCTION public.generate_passport_number();
