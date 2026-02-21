-- RLS Policies Setup for Supabase
-- Run this in the Supabase SQL Editor after running the schema migration
-- This ensures each user can only access their own data

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PATIENTS POLICIES
-- ============================================================================

-- Allow users to view only their own patients
CREATE POLICY "Users can view own patients"
  ON patients FOR SELECT
  USING (auth.uid()::text = user_id);

-- Allow users to insert their own patients
CREATE POLICY "Users can insert own patients"
  ON patients FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update only their own patients
CREATE POLICY "Users can update own patients"
  ON patients FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to delete only their own patients
CREATE POLICY "Users can delete own patients"
  ON patients FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- BEHAVIORS POLICIES (via patient relationship)
-- ============================================================================

-- Allow users to view behaviors of their own patients
CREATE POLICY "Users can view own behaviors"
  ON behaviors FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
  );

-- Allow users to insert behaviors for their own patients
CREATE POLICY "Users can insert own behaviors"
  ON behaviors FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
  );

-- Allow users to update behaviors of their own patients
CREATE POLICY "Users can update own behaviors"
  ON behaviors FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
  );

-- Allow users to delete behaviors of their own patients
CREATE POLICY "Users can delete own behaviors"
  ON behaviors FOR DELETE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
  );

-- ============================================================================
-- SESSIONS POLICIES (via patient relationship)
-- ============================================================================

-- Allow users to view sessions of their own patients
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
  );

-- Allow users to insert sessions for their own patients
CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
  );

-- Allow users to update sessions of their own patients
CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
  );

-- Allow users to delete sessions of their own patients
CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
  );

-- ============================================================================
-- SESSION_LOGS POLICIES (via session -> patient relationship)
-- ============================================================================

-- Allow users to view session logs of their own patients' sessions
CREATE POLICY "Users can view own session logs"
  ON session_logs FOR SELECT
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      INNER JOIN patients p ON s.patient_id = p.id
      WHERE p.user_id = auth.uid()::text
    )
  );

-- Allow users to insert session logs for their own patients' sessions
CREATE POLICY "Users can insert own session logs"
  ON session_logs FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT s.id FROM sessions s
      INNER JOIN patients p ON s.patient_id = p.id
      WHERE p.user_id = auth.uid()::text
    )
  );

-- Allow users to update session logs of their own patients' sessions
CREATE POLICY "Users can update own session logs"
  ON session_logs FOR UPDATE
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      INNER JOIN patients p ON s.patient_id = p.id
      WHERE p.user_id = auth.uid()::text
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT s.id FROM sessions s
      INNER JOIN patients p ON s.patient_id = p.id
      WHERE p.user_id = auth.uid()::text
    )
  );

-- Allow users to delete session logs of their own patients' sessions
CREATE POLICY "Users can delete own session logs"
  ON session_logs FOR DELETE
  USING (
    session_id IN (
      SELECT s.id FROM sessions s
      INNER JOIN patients p ON s.patient_id = p.id
      WHERE p.user_id = auth.uid()::text
    )
  );

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify policies are active:
-- SELECT tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname;
