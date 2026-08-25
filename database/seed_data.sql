-- ==============================================================================
-- SIERRA LEONE IMMIGRATION SYSTEM (SLID) — SEED DATA
-- ==============================================================================
-- Run this in your Supabase SQL Editor to populate initial master data.

-- 1. VISA TYPES
INSERT INTO public.visa_types (name, description, fee_amount, validity_days, max_stay_days, available_on_arrival)
VALUES
  (
    'Tourist Visa (Single Entry)',
    'Standard tourist entry visa for tourism, holidays, and visiting family.',
    80.00,
    90,
    30,
    true
  ),
  (
    'Tourist Visa (Multiple Entry)',
    'Multiple entry tourist visa for frequent short-term visitors.',
    150.00,
    180,
    90,
    false
  ),
  (
    'Business Visa (Single Entry)',
    'For commercial visits, conferences, business meetings, and trade inquiries.',
    160.00,
    90,
    30,
    true
  ),
  (
    'Business Visa (Multiple Entry)',
    'Longer validity business visa for verified company representatives.',
    300.00,
    365,
    90,
    false
  ),
  (
    'Transit Visa',
    'Short stay transit visa for travelers passing through Sierra Leone to a third country.',
    40.00,
    7,
    3,
    true
  ),
  (
    'Study / Student Visa',
    'For international students enrolled in accredited educational institutions in Sierra Leone.',
    120.00,
    365,
    365,
    false
  );

-- 2. OFFICIAL CHECKPOINTS
INSERT INTO public.checkpoints (name, location, checkpoint_type)
VALUES
  (
    'Freetown-Lungi International Airport (FNA)',
    'Lungi, Port Loko District',
    'airport'
  ),
  (
    'Queen Elizabeth II Quay (Deep Water Quay)',
    'Cline Town, Freetown',
    'seaport'
  ),
  (
    'Gbalamuya (Kambia) Border Post',
    'Kambia District (Guinea Border)',
    'land_border'
  ),
  (
    'Jendema (Mano River Union) Border Post',
    'Pujehun District (Liberia Border)',
    'land_border'
  ),
  (
    'Koindu (Kailahun) Border Post',
    'Kailahun District (Tri-border area)',
    'land_border'
  );

-- 3. WATCHLIST DEMO ENTRIES (FOR TESTING BORDER RISK SCORING)
INSERT INTO public.watchlist (passport_number, full_name, reason, risk_level)
VALUES
  (
    'WL-TEST-999',
    'Johnathan Redacted Doe',
    'Interpol Red Notice — Wanted for financial fraud in ECOWAS jurisdiction',
    'high'
  ),
  (
    'WL-TEST-888',
    'Amadou Alpha Barry',
    'Active Deportation Order — Previous immigration violation',
    'high'
  ),
  (
    'WL-TEST-777',
    'Marcus Alexander Vance',
    'Court Travel Restriction — Pending judicial proceedings in High Court',
    'medium'
  );
