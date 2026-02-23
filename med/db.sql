-- ─────────────────────────────────────────────
-- MediProfile — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────

-- 1. Create the table
CREATE TABLE IF NOT EXISTS medical_profiles (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        TEXT,

  -- Personal
  firstname         TEXT          NOT NULL,
  lastname          TEXT          NOT NULL,
  dob               DATE,
  gender            TEXT,
  phone             TEXT,
  email             TEXT,
  address           TEXT,
  ec_name           TEXT,          -- emergency contact name
  ec_phone          TEXT,          -- emergency contact phone

  -- Medical
  blood_group       TEXT,
  height            NUMERIC,
  weight            NUMERIC,
  risk_level        TEXT          DEFAULT 'low' CHECK (risk_level IN ('low','medium','high','critical')),
  doctor            TEXT,
  conditions        JSONB         DEFAULT '[]',
  allergies         JSONB         DEFAULT '[]',
  notes             TEXT,

  -- Structured lists (stored as JSONB arrays)
  medications_list  JSONB         DEFAULT '[]',
  surgeries_list    JSONB         DEFAULT '[]',
  attachments       JSONB         DEFAULT '[]',

  -- Vitals snapshot (single JSONB object)
  vitals            JSONB         DEFAULT '{}',

  -- Timestamps
  created_at        TIMESTAMPTZ   DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   DEFAULT NOW()
);

-- 2. Index for fast search by name / risk
CREATE INDEX IF NOT EXISTS idx_medical_profiles_name
  ON medical_profiles (lastname, firstname);

CREATE INDEX IF NOT EXISTS idx_medical_profiles_risk
  ON medical_profiles (risk_level);

CREATE INDEX IF NOT EXISTS idx_medical_profiles_created
  ON medical_profiles (created_at DESC);

-- 3. Auto-update `updated_at` on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_medical_profiles_updated_at
  BEFORE UPDATE ON medical_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. Enable Row Level Security
ALTER TABLE medical_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Public access policy (matches your publishable key setup)
--    If you add auth later, replace these with user-scoped policies.
CREATE POLICY "allow_select" ON medical_profiles
  FOR SELECT USING (true);

CREATE POLICY "allow_insert" ON medical_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_update" ON medical_profiles
  FOR UPDATE USING (true);

CREATE POLICY "allow_delete" ON medical_profiles
  FOR DELETE USING (true);

-- 6. Optional: verify the table looks right
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'medical_profiles'
ORDER BY ordinal_position;