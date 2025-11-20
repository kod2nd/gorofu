-- Golf App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table: Extended user information and roles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE, -- References auth.users.id
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  roles TEXT[] NOT NULL DEFAULT ARRAY['user']::TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  country TEXT DEFAULT 'Singapore',
  handicap DECIMAL(3,1),
  scoring_bias INTEGER DEFAULT 1, -- 0=Par, 1=Bogey, 2=Double Bogey
  phone TEXT,
  date_of_birth DATE,
  created_by TEXT, -- email of admin who created/approved the user
  approved_at TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User invitations table: For onboarding new users
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  invited_by TEXT NOT NULL, -- email of admin who sent invitation
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for user management actions
CREATE TABLE user_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_user_email TEXT NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'suspended', 'activated', 'role_changed', etc.
  performed_by TEXT NOT NULL, -- email of admin who performed the action
  old_values JSONB,
  new_values JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table: Master course data shared among all users
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT DEFAULT 'Singapore',
  city TEXT,
  created_by TEXT NOT NULL, -- email of user who first added the course
  is_verified BOOLEAN DEFAULT FALSE, -- admin verified course data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_course_per_country UNIQUE(name, country)
);

-- Course tee boxes: Hole distances and pars per tee box
CREATE TABLE course_tee_boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tee_box TEXT NOT NULL,
  hole_number INTEGER NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
  par INTEGER CHECK (par >= 2 AND par <= 7),
  distance INTEGER CHECK (distance > 0),
  yards_or_meters_unit TEXT DEFAULT 'yards' CHECK (yards_or_meters_unit IN ('yards', 'meters')),
  last_updated_by TEXT NOT NULL, -- email of user who last updated this hole
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_hole_per_tee_box UNIQUE(course_id, tee_box, hole_number)
);

-- Course change requests: Maker-checker workflow for course updates
CREATE TABLE course_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tee_box TEXT NOT NULL,
  hole_number INTEGER NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
  current_par INTEGER,
  current_distance INTEGER,
  proposed_par INTEGER,
  proposed_distance INTEGER,
  current_yards_or_meters_unit TEXT,
  proposed_yards_or_meters_unit TEXT,
  requested_by TEXT NOT NULL, -- email of requesting user
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT, -- email of admin who reviewed
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rounds table: Round-level data
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tee_box TEXT NOT NULL,
  round_date DATE NOT NULL,
  round_type TEXT DEFAULT '18_holes' CHECK (round_type IN ('front_9', 'back_9', '18_holes')),
  scoring_zone_level TEXT NOT NULL,
  total_holes_played INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  total_putts INTEGER DEFAULT 0,
  total_penalties INTEGER DEFAULT 0,
  is_eligible_round BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Round holes table: Actual performance data per hole
CREATE TABLE round_holes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL CHECK (hole_number >= 1 AND hole_number <= 18),
  hole_score INTEGER CHECK (hole_score > 0),
  putts INTEGER CHECK (putts >= 0),
  putts_within4ft INTEGER DEFAULT 0 CHECK (putts_within4ft >= 0),
  penalty_shots INTEGER DEFAULT 0 CHECK (penalty_shots >= 0),
  scoring_zone_in_regulation BOOLEAN DEFAULT FALSE,
  holeout_from_outside_4ft BOOLEAN DEFAULT FALSE,
  holeout_within_3_shots_scoring_zone BOOLEAN DEFAULT FALSE,
  bad_habits TEXT[] DEFAULT '{}',
  par INTEGER CHECK (par >= 2 AND par <= 7),
  distance INTEGER CHECK (distance > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_hole_per_round UNIQUE(round_id, hole_number)
);

-- Table to link coaches to their students
CREATE TABLE IF NOT EXISTS public.coach_student_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coach_user_id UUID NOT NULL,
  student_user_id UUID NOT NULL,
  CONSTRAINT fk_coach FOREIGN KEY (coach_user_id) REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_student FOREIGN KEY (student_user_id) REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_coach_student UNIQUE (coach_user_id, student_user_id)
);

-- Table for coaches to leave notes for students
CREATE TABLE IF NOT EXISTS public.coach_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL,
  student_id UUID NOT NULL,
  parent_note_id UUID REFERENCES public.coach_notes(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  subject TEXT,
  lesson_date TIMESTAMP WITH TIME ZONE,
  is_favorited BOOLEAN DEFAULT FALSE,
  is_pinned_to_dashboard BOOLEAN DEFAULT FALSE;
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_author_note FOREIGN KEY (author_id) REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_student_note FOREIGN KEY (student_id) REFERENCES public.user_profiles(user_id) ON DELETE CASCADE
);

-- Enable RLS for the coach_notes table
ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;

-- Enable RLS for the new table
ALTER TABLE public.coach_student_mappings ENABLE ROW LEVEL SECURITY;

-- Create the 'internal' schema if it doesn't already exist.
-- This schema will hold objects that should not be directly exposed to the API.
CREATE SCHEMA IF NOT EXISTS internal;

-- Create a view on user_profiles that bypasses RLS for internal checks.
-- We grant SELECT access only to the 'postgres' role, which is the role that SECURITY DEFINER functions run as.
CREATE OR REPLACE VIEW internal.user_profiles_unrestricted AS
SELECT * FROM public.user_profiles;

GRANT SELECT ON internal.user_profiles_unrestricted TO postgres;

-- Create indexes for better performance
CREATE INDEX idx_courses_country ON courses(country);
CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_course_tee_boxes_course_tee ON course_tee_boxes(course_id, tee_box);
CREATE INDEX idx_rounds_user_email ON rounds(user_email);
CREATE INDEX idx_rounds_course_date ON rounds(course_id, round_date);
CREATE INDEX idx_round_holes_round_id ON round_holes(round_id);
CREATE INDEX IF NOT EXISTS idx_course_change_requests_course_id ON course_change_requests(course_id);

-- Helper function to get the role of the current user
-- This function checks if the current user has AT LEAST ONE of the specified roles, using the unrestricted view.
CREATE OR REPLACE FUNCTION has_roles(roles_to_check TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = internal, public -- Prioritize the internal schema
AS $$
DECLARE
  user_roles_array TEXT[];
BEGIN
  -- Check for impersonation variable
  IF current_setting('app.impersonated_user_email', true) IS NOT NULL AND current_setting('app.impersonated_user_email', true) <> '' THEN
    -- If impersonating, return the role of the impersonated user from the unrestricted view
    SELECT roles INTO user_roles_array FROM internal.user_profiles_unrestricted WHERE email = current_setting('app.impersonated_user_email');
  ELSE
    -- Otherwise, get roles for the currently authenticated user
    SELECT roles INTO user_roles_array FROM internal.user_profiles_unrestricted WHERE user_id = auth.uid();
  END IF;

  -- Check for intersection between user's roles and the roles to check
  RETURN user_roles_array && roles_to_check;
END;
$$;

-- Helper function to get the roles of the current user
CREATE OR REPLACE FUNCTION get_my_roles()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = internal, public
AS $$
BEGIN
  -- Check for impersonation variable
  IF current_setting('app.impersonated_user_email', true) IS NOT NULL AND current_setting('app.impersonated_user_email', true) <> '' THEN
    -- If impersonating, return the roles of the impersonated user from the unrestricted view
    RETURN (SELECT roles FROM internal.user_profiles_unrestricted WHERE email = current_setting('app.impersonated_user_email'));
  ELSE
    -- Otherwise, return the role of the currently authenticated user
    RETURN (SELECT roles FROM internal.user_profiles_unrestricted WHERE user_id = auth.uid());
  END IF;
END;
$$;

-- Helper function to check if a user is a student of the current user (who must be a coach)
CREATE OR REPLACE FUNCTION is_my_student(student_email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  active_user_id UUID;
  is_student BOOLEAN;
BEGIN
  -- Get the user_id of the currently active user (impersonated or logged-in)
  SELECT user_id INTO active_user_id FROM public.user_profiles 
  WHERE email = COALESCE(current_setting('app.impersonated_user_email', true), auth.jwt() ->> 'email')
  LIMIT 1;

  -- Only check if the current user is a coach
  IF NOT (SELECT 'coach' = ANY(roles) FROM public.user_profiles WHERE user_id = active_user_id) THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.coach_student_mappings csm
    JOIN public.user_profiles sp ON csm.student_user_id = sp.user_id
    WHERE csm.coach_user_id = active_user_id
    AND sp.email = student_email_to_check
  ) INTO is_student;

  RETURN is_student;
END;
$$;

CREATE OR REPLACE FUNCTION is_coach_viewing_authorized()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_email TEXT;
  user_roles_array TEXT[];
BEGIN
  current_user_email := COALESCE(
    current_setting('app.impersonated_user_email', true),
    auth.jwt() ->> 'email'
  );

  IF current_user_email IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get current user's roles
  SELECT roles INTO user_roles_array 
  FROM user_profiles 
  WHERE email = current_user_email;

  -- Return true if user is a coach
  RETURN 'coach' = ANY(user_roles_array);
END;
$$;

-- Function to calculate the current SZIR streak for a user
CREATE OR REPLACE FUNCTION calculate_user_szir_streak(user_email_param TEXT)
RETURNS INTEGER
LANGUAGE plpgsql STABLE SET search_path = 'public'
AS $$
DECLARE
    streak_count INTEGER := 0;
    hole_record RECORD;
BEGIN
    FOR hole_record IN
        SELECT rh.scoring_zone_in_regulation
        FROM round_holes rh
        JOIN rounds r ON rh.round_id = r.id
        WHERE r.user_email = user_email_param
        ORDER BY r.round_date DESC, rh.hole_number DESC
    LOOP
        IF hole_record.scoring_zone_in_regulation THEN
            streak_count := streak_count + 1;
        ELSE
            -- The streak is broken, so we can stop counting.
            EXIT;
        END IF;
    END LOOP;

    RETURN streak_count;
END;
$$;

-- Function to calculate the current SZ Par streak for a user
CREATE OR REPLACE FUNCTION calculate_user_szpar_streak(user_email_param TEXT)
RETURNS INTEGER
LANGUAGE plpgsql STABLE SET search_path = 'public'
AS $$
DECLARE
    streak_count INTEGER := 0;
    hole_record RECORD;
BEGIN
    FOR hole_record IN
        SELECT rh.holeout_within_3_shots_scoring_zone
        FROM round_holes rh
        JOIN rounds r ON rh.round_id = r.id
        WHERE r.user_email = user_email_param AND rh.scoring_zone_in_regulation = TRUE
        ORDER BY r.round_date DESC, rh.hole_number DESC
    LOOP
        IF hole_record.holeout_within_3_shots_scoring_zone THEN
            streak_count := streak_count + 1;
        ELSE
            EXIT; -- The streak is broken
        END IF;
    END LOOP;
    RETURN streak_count;
END;
$$;

-- Function to search for courses and include aggregated tee box stats
CREATE OR REPLACE FUNCTION search_courses_with_stats(
  search_term TEXT DEFAULT '',
  country_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  country TEXT,
  city TEXT,
  tee_box_stats JSONB
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.country,
    c.city,
    (
      SELECT jsonb_agg(tbs)
      FROM (
        SELECT tee_box, COUNT(hole_number) as hole_count, SUM(par) as total_par, SUM(distance) as total_distance, MAX(yards_or_meters_unit) as yards_or_meters_unit
        FROM course_tee_boxes ctb
        WHERE ctb.course_id = c.id
        GROUP BY ctb.tee_box
      ) tbs
    ) as tee_box_stats
  FROM courses c
  WHERE (country_filter IS NULL OR c.country = country_filter)
    AND (search_term = '' OR c.name ILIKE '%' || search_term || '%')
  ORDER BY c.name;
END;
$$;

-- Drop the function first to allow changing the return signature
DROP FUNCTION IF EXISTS public.get_user_cumulative_stats(TEXT); -- Keep this to ensure idempotency

-- Function to get cumulative (all-time) stats for a user
CREATE OR REPLACE FUNCTION get_user_cumulative_stats(user_email_param TEXT)
RETURNS TABLE(total_rounds_played BIGINT, eligible_rounds_count BIGINT, total_holes_played BIGINT, avg_score NUMERIC, avg_putts NUMERIC, total_szir BIGINT)
LANGUAGE plpgsql STABLE SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT r.id)::BIGINT AS total_rounds_played,
        COALESCE(
            COUNT(DISTINCT r.id) FILTER (WHERE r.is_eligible_round = TRUE),
            0
        )::BIGINT AS eligible_rounds_count,
        COALESCE(
            SUM(CASE WHEN rh.hole_score IS NOT NULL AND rh.putts IS NOT NULL THEN 1 ELSE 0 END),
            0
        )::BIGINT AS total_holes_played,
        COALESCE(AVG(rh.hole_score), 0)::NUMERIC as avg_score,
        COALESCE(AVG(rh.putts), 0)::NUMERIC as avg_putts,
        COALESCE(SUM(CASE WHEN rh.scoring_zone_in_regulation THEN 1 ELSE 0 END), 0)::BIGINT as total_szir
    FROM
        rounds r
    LEFT JOIN
        round_holes rh ON r.id = rh.round_id
    WHERE
        r.user_email = user_email_param;
END;
$$;

-- Drop the function first to allow changing the return signature
DROP FUNCTION IF EXISTS public.get_recent_rounds_stats(TEXT, INT, BOOLEAN, NUMERIC);

DROP FUNCTION get_recent_rounds_base_stats(text,integer,boolean);

-- NEW: Function for base stats
CREATE OR REPLACE FUNCTION get_recent_rounds_base_stats(user_email_param TEXT, round_limit INT, eligible_rounds_only BOOLEAN)
RETURNS TABLE (
    total_holes_played BIGINT,
    avg_putts_per_hole NUMERIC,
    szir_percentage NUMERIC,
    szir_count BIGINT,
    multi_putt_4ft_holes BIGINT,
    holeout_within_3_shots_count BIGINT,
    holeout_from_outside_4ft_count BIGINT,
    total_penalties BIGINT,
    avg_penalties_per_round NUMERIC,
    one_putt_count BIGINT,
    two_putt_count BIGINT,
    three_putt_plus_count BIGINT,
    birdie_or_better_count BIGINT,
    par_count BIGINT,
    bogey_count BIGINT,
    double_bogey_count BIGINT,
    triple_bogey_plus_count BIGINT
)
LANGUAGE plpgsql STABLE SET search_path = 'public' AS $$
BEGIN
    RETURN QUERY
    WITH recent_rounds AS (
        SELECT id FROM rounds
        WHERE user_email = user_email_param AND (NOT eligible_rounds_only OR is_eligible_round = TRUE)
        ORDER BY round_date DESC, created_at DESC
        LIMIT CASE WHEN round_limit > 0 THEN round_limit ELSE NULL END
    )
    SELECT
        COUNT(rh.id)::BIGINT,
        COALESCE(AVG(rh.putts), 0)::NUMERIC,
        (CASE WHEN COUNT(rh.id) > 0 THEN (SUM(CASE WHEN rh.scoring_zone_in_regulation THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(rh.id), 0) * 100) ELSE 0 END)::NUMERIC,
        COALESCE(SUM(CASE WHEN rh.scoring_zone_in_regulation THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.putts_within4ft > 1 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.holeout_within_3_shots_scoring_zone THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.holeout_from_outside_4ft THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(rh.penalty_shots), 0)::BIGINT,
        (CASE WHEN COUNT(DISTINCT r.id) > 0 THEN SUM(rh.penalty_shots)::NUMERIC / NULLIF(COUNT(DISTINCT r.id), 0) ELSE 0 END)::NUMERIC,
        COALESCE(SUM(CASE WHEN rh.putts = 1 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.putts = 2 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.putts >= 3 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.hole_score < ctb.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.hole_score = ctb.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.hole_score = ctb.par + 1 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.hole_score = ctb.par + 2 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.hole_score >= ctb.par + 3 THEN 1 ELSE 0 END), 0)::BIGINT
    FROM rounds r
    JOIN round_holes rh ON r.id = rh.round_id
    JOIN course_tee_boxes ctb ON r.course_id = ctb.course_id AND r.tee_box = ctb.tee_box AND rh.hole_number = ctb.hole_number
    WHERE r.id IN (SELECT id FROM recent_rounds);
END;
$$;

-- NEW: Function for par type stats
CREATE OR REPLACE FUNCTION get_recent_rounds_par_type_stats(user_email_param TEXT, round_limit INT, eligible_rounds_only BOOLEAN)
RETURNS TABLE (
    avg_par3_score NUMERIC, 
    avg_par4_score NUMERIC, 
    avg_par5_score NUMERIC,
    avg_putts_par3 NUMERIC, avg_putts_par4 NUMERIC, avg_putts_par5 NUMERIC,
    par3_birdie_or_better_count BIGINT, par3_par_count BIGINT, par3_bogey_count BIGINT, par3_double_bogey_count BIGINT, par3_triple_bogey_plus_count BIGINT,
    par4_birdie_or_better_count BIGINT, par4_par_count BIGINT, par4_bogey_count BIGINT, par4_double_bogey_count BIGINT, par4_triple_bogey_plus_count BIGINT,
    par5_birdie_or_better_count BIGINT, par5_par_count BIGINT, par5_bogey_count BIGINT, par5_double_bogey_count BIGINT, par5_triple_bogey_plus_count BIGINT
)
LANGUAGE plpgsql STABLE SET search_path = 'public' AS $$
BEGIN
    RETURN QUERY
    WITH recent_rounds AS (
        SELECT id FROM rounds
        WHERE user_email = user_email_param AND (NOT eligible_rounds_only OR is_eligible_round = TRUE)
        ORDER BY round_date DESC, created_at DESC
        LIMIT CASE WHEN round_limit > 0 THEN round_limit ELSE NULL END
    )
    SELECT
        (AVG(rh.hole_score) FILTER (WHERE ctb.par = 3))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE ctb.par = 4))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE ctb.par = 5))::NUMERIC,
        (AVG(rh.putts) FILTER (WHERE ctb.par = 3))::NUMERIC,
        (AVG(rh.putts) FILTER (WHERE ctb.par = 4))::NUMERIC,
        (AVG(rh.putts) FILTER (WHERE ctb.par = 5))::NUMERIC,
        COALESCE(SUM(CASE WHEN ctb.par = 3 AND rh.hole_score < ctb.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 3 AND rh.hole_score = ctb.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 3 AND rh.hole_score = ctb.par + 1 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 3 AND rh.hole_score = ctb.par + 2 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 3 AND rh.hole_score >= ctb.par + 3 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 4 AND rh.hole_score < ctb.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 4 AND rh.hole_score = ctb.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 4 AND rh.hole_score = ctb.par + 1 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 4 AND rh.hole_score = ctb.par + 2 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 4 AND rh.hole_score >= ctb.par + 3 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 5 AND rh.hole_score < ctb.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 5 AND rh.hole_score = ctb.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 5 AND rh.hole_score = ctb.par + 1 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 5 AND rh.hole_score = ctb.par + 2 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 5 AND rh.hole_score >= ctb.par + 3 THEN 1 ELSE 0 END), 0)::BIGINT
    FROM rounds r
    JOIN round_holes rh ON r.id = rh.round_id
    JOIN course_tee_boxes ctb ON r.course_id = ctb.course_id AND r.tee_box = ctb.tee_box AND rh.hole_number = ctb.hole_number
    WHERE r.id IN (SELECT id FROM recent_rounds);
END;
$$;

-- Drop the function first
DROP FUNCTION IF EXISTS get_recent_rounds_advanced_stats(text,integer,boolean,numeric);
-- NEW: Function for advanced stats
CREATE OR REPLACE FUNCTION get_recent_rounds_advanced_stats(user_email_param TEXT, round_limit INT, eligible_rounds_only BOOLEAN, relative_distance_threshold NUMERIC DEFAULT 0.15)
RETURNS TABLE (
    -- SZIR/SZ Par stats
    avg_score_with_szir NUMERIC,
    avg_score_without_szir NUMERIC,
    avg_score_with_szpar NUMERIC,
    avg_score_without_szpar NUMERIC,
    avg_score_with_szir_par3 NUMERIC, avg_score_with_szir_par4 NUMERIC, avg_score_with_szir_par5 NUMERIC,
    avg_score_without_szir_par3 NUMERIC, avg_score_without_szir_par4 NUMERIC, avg_score_without_szir_par5 NUMERIC,
    avg_score_with_szpar_par3 NUMERIC, avg_score_without_szpar_par3 NUMERIC, avg_score_with_szpar_par4 NUMERIC,
    avg_score_without_szpar_par4 NUMERIC, avg_score_with_szpar_par5 NUMERIC, avg_score_without_szpar_par5 NUMERIC,
    -- Penalty stats
    avg_score_with_penalty_par3 NUMERIC, avg_score_without_penalty_par3 NUMERIC, avg_score_with_penalty_par4 NUMERIC,
    avg_score_without_penalty_par4 NUMERIC, avg_score_with_penalty_par5 NUMERIC, avg_score_without_penalty_par5 NUMERIC,
    penalty_on_par3_count BIGINT, penalty_on_par4_count BIGINT, penalty_on_par5_count BIGINT,
    -- Luck stats
    luck_on_par3_count BIGINT, luck_on_par4_count BIGINT, luck_on_par5_count BIGINT,
    total_par3_holes BIGINT, total_par4_holes BIGINT, total_par5_holes BIGINT,
    luck_with_szir_count BIGINT, luck_without_szir_count BIGINT,
    total_szir_holes BIGINT, total_non_szir_holes BIGINT,
    -- Relative distance stats
    avg_dist_par3 NUMERIC, avg_dist_par4 NUMERIC, avg_dist_par5 NUMERIC,
    avg_score_short_par3 NUMERIC, avg_score_medium_par3 NUMERIC, avg_score_long_par3 NUMERIC,
    avg_score_short_par4 NUMERIC, avg_score_medium_par4 NUMERIC, avg_score_long_par4 NUMERIC,
    avg_score_short_par5 NUMERIC, avg_score_medium_par5 NUMERIC, avg_score_long_par5 NUMERIC
)
LANGUAGE plpgsql STABLE SET search_path = 'public' AS $$
BEGIN
    RETURN QUERY
    WITH recent_rounds AS (
        SELECT id FROM rounds
        WHERE user_email = user_email_param AND (NOT eligible_rounds_only OR is_eligible_round = TRUE)
        ORDER BY round_date DESC, created_at DESC
        LIMIT CASE WHEN round_limit > 0 THEN round_limit ELSE NULL END
    ),
    all_holes AS (
        SELECT rh.hole_score, rh.scoring_zone_in_regulation, rh.holeout_within_3_shots_scoring_zone, rh.penalty_shots, rh.holeout_from_outside_4ft, ctb.par as course_par, ctb.distance as course_distance
        FROM round_holes rh
        JOIN rounds r ON rh.round_id = r.id
        JOIN course_tee_boxes ctb ON r.course_id = ctb.course_id AND r.tee_box = ctb.tee_box AND rh.hole_number = ctb.hole_number
        WHERE r.id IN (SELECT id FROM recent_rounds)
    ),
    avg_distances AS (
        SELECT
            COALESCE(AVG(course_distance) FILTER (WHERE course_par = 3), 0) AS avg_d_p3,
            COALESCE(AVG(course_distance) FILTER (WHERE course_par = 4), 0) AS avg_d_p4,
            COALESCE(AVG(course_distance) FILTER (WHERE course_par = 5), 0) AS avg_d_p5
        FROM all_holes
    )
    SELECT
        -- SZIR/SZ Par stats
        (AVG(ah.hole_score) FILTER (WHERE ah.scoring_zone_in_regulation IS TRUE))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.scoring_zone_in_regulation IS FALSE))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.holeout_within_3_shots_scoring_zone IS TRUE))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.holeout_within_3_shots_scoring_zone IS FALSE AND ah.scoring_zone_in_regulation IS TRUE))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.scoring_zone_in_regulation IS TRUE AND ah.course_par = 3))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.scoring_zone_in_regulation IS TRUE AND ah.course_par = 4))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.scoring_zone_in_regulation IS TRUE AND ah.course_par = 5))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.scoring_zone_in_regulation IS FALSE AND ah.course_par = 3))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.scoring_zone_in_regulation IS FALSE AND ah.course_par = 4))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.scoring_zone_in_regulation IS FALSE AND ah.course_par = 5))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.holeout_within_3_shots_scoring_zone IS TRUE AND ah.course_par = 3))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.holeout_within_3_shots_scoring_zone IS FALSE AND ah.scoring_zone_in_regulation IS TRUE AND ah.course_par = 3))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.holeout_within_3_shots_scoring_zone IS TRUE AND ah.course_par = 4))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.holeout_within_3_shots_scoring_zone IS FALSE AND ah.scoring_zone_in_regulation IS TRUE AND ah.course_par = 4))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.holeout_within_3_shots_scoring_zone IS TRUE AND ah.course_par = 5))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.holeout_within_3_shots_scoring_zone IS FALSE AND ah.scoring_zone_in_regulation IS TRUE AND ah.course_par = 5))::NUMERIC,
        -- Penalty stats
        (AVG(ah.hole_score) FILTER (WHERE ah.penalty_shots > 0 AND ah.course_par = 3))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.penalty_shots = 0 AND ah.course_par = 3))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.penalty_shots > 0 AND ah.course_par = 4))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.penalty_shots = 0 AND ah.course_par = 4))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.penalty_shots > 0 AND ah.course_par = 5))::NUMERIC, (AVG(ah.hole_score) FILTER (WHERE ah.penalty_shots = 0 AND ah.course_par = 5))::NUMERIC,
        COALESCE(SUM(CASE WHEN ah.course_par = 3 AND ah.penalty_shots > 0 THEN 1 ELSE 0 END), 0)::BIGINT, COALESCE(SUM(CASE WHEN ah.course_par = 4 AND ah.penalty_shots > 0 THEN 1 ELSE 0 END), 0)::BIGINT, COALESCE(SUM(CASE WHEN ah.course_par = 5 AND ah.penalty_shots > 0 THEN 1 ELSE 0 END), 0)::BIGINT,
        -- Luck stats
        COALESCE(SUM(CASE WHEN ah.course_par = 3 AND ah.holeout_from_outside_4ft THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ah.course_par = 4 AND ah.holeout_from_outside_4ft THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ah.course_par = 5 AND ah.holeout_from_outside_4ft THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ah.course_par = 3 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ah.course_par = 4 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ah.course_par = 5 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ah.scoring_zone_in_regulation IS TRUE AND ah.holeout_from_outside_4ft THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ah.scoring_zone_in_regulation IS FALSE AND ah.holeout_from_outside_4ft THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ah.scoring_zone_in_regulation IS TRUE THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ah.scoring_zone_in_regulation IS FALSE THEN 1 ELSE 0 END), 0)::BIGINT,
        -- Relative distance stats
        MAX(ad.avg_d_p3), MAX(ad.avg_d_p4), MAX(ad.avg_d_p5),
        (AVG(ah.hole_score) FILTER (WHERE ah.course_par = 3 AND ah.course_distance < ad.avg_d_p3 * (1 - relative_distance_threshold)))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.course_par = 3 AND ah.course_distance >= ad.avg_d_p3 * (1 - relative_distance_threshold) AND ah.course_distance <= ad.avg_d_p3 * (1 + relative_distance_threshold)))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.course_par = 3 AND ah.course_distance > ad.avg_d_p3 * (1 + relative_distance_threshold)))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.course_par = 4 AND ah.course_distance < ad.avg_d_p4 * (1 - relative_distance_threshold)))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.course_par = 4 AND ah.course_distance >= ad.avg_d_p4 * (1 - relative_distance_threshold) AND ah.course_distance <= ad.avg_d_p4 * (1 + relative_distance_threshold)))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.course_par = 4 AND ah.course_distance > ad.avg_d_p4 * (1 + relative_distance_threshold)))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.course_par = 5 AND ah.course_distance < ad.avg_d_p5 * (1 - relative_distance_threshold)))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.course_par = 5 AND ah.course_distance >= ad.avg_d_p5 * (1 - relative_distance_threshold) AND ah.course_distance <= ad.avg_d_p5 * (1 + relative_distance_threshold)))::NUMERIC,
        (AVG(ah.hole_score) FILTER (WHERE ah.course_par = 5 AND ah.course_distance > ad.avg_d_p5 * (1 + relative_distance_threshold)))::NUMERIC
    FROM all_holes ah, avg_distances ad;
END;
$$;

-- Grant execute permissions to the authenticated role for the new functions
-- This allows the functions to be called from the client-side library
GRANT EXECUTE ON FUNCTION public.calculate_user_szir_streak(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_user_szpar_streak(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_cumulative_stats(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_recent_rounds_base_stats(TEXT, INT, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_recent_rounds_par_type_stats(TEXT, INT, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_recent_rounds_advanced_stats(TEXT, INT, BOOLEAN, NUMERIC) TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.search_courses_with_stats(TEXT, TEXT) TO authenticated, service_role;
-- Grant execute permissions for uuid_generate_v4 to allow creating invitation tokens
-- This function is part of the uuid-ossp extension
GRANT EXECUTE ON FUNCTION extensions.uuid_generate_v4() TO authenticated, service_role;

-- Function for super_admins to set an impersonation session variable
CREATE OR REPLACE FUNCTION set_impersonation(user_email_to_impersonate TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  -- Only allow super_admins to call this function
  IF NOT (SELECT 'super_admin' = ANY(roles) FROM user_profiles WHERE user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Only super_admins can impersonate users.';
  END IF;

  -- Set the session variable. The 'true' means it's a local setting for the current transaction.
  PERFORM set_config('app.impersonated_user_email', user_email_to_impersonate, true);
  
  RETURN 'Impersonating ' || user_email_to_impersonate;
END;
$$;

-- Grant execute permissions for the impersonation function
GRANT EXECUTE ON FUNCTION public.set_impersonation(TEXT) TO authenticated, service_role;

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_tee_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_holes ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can view their own profile, admins can view all
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (has_roles(ARRAY['admin', 'super_admin']));
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid());
-- Coaches can view profiles of other coaches and students for note display and mapping
CREATE POLICY "Coaches can view relevant user profiles" ON public.user_profiles FOR SELECT USING (
  has_roles(ARRAY['coach']) AND (
    user_id = auth.uid() OR -- Their own profile
    'coach' = ANY(roles) OR -- Allow viewing any coach profile
    EXISTS (SELECT 1 FROM public.coach_student_mappings WHERE student_user_id = user_profiles.user_id) -- Allow viewing any student profile (if they are a student in any mapping)
  )
);
CREATE POLICY "Admins can update any profile" ON user_profiles FOR UPDATE USING (has_roles(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins can create profiles" ON user_profiles FOR INSERT WITH CHECK (has_roles(ARRAY['admin', 'super_admin']));

-- User invitations: Only admins can manage invitations
CREATE POLICY "Admins can view invitations" ON user_invitations FOR SELECT USING (has_roles(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins can create invitations" ON user_invitations FOR INSERT WITH CHECK (has_roles(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins can update invitations" ON user_invitations FOR UPDATE USING (has_roles(ARRAY['admin', 'super_admin']));

-- Audit log: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON user_audit_log FOR SELECT USING (has_roles(ARRAY['admin', 'super_admin']));
CREATE POLICY "System can create audit logs" ON user_audit_log FOR INSERT WITH CHECK (true);

-- Courses: Everyone can read, authenticated users can create
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create courses" ON courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Course creators can update their courses" ON courses FOR UPDATE USING (created_by = auth.jwt() ->> 'email');
CREATE POLICY "Admins can delete courses" ON courses FOR DELETE USING (has_roles(ARRAY['admin', 'super_admin']));

-- Course tee boxes: Everyone can read, authenticated users can create/update
CREATE POLICY "Anyone can view course tee boxes" ON course_tee_boxes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tee box data" ON course_tee_boxes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update tee box data they created" ON course_tee_boxes FOR UPDATE USING (auth.role() = 'authenticated');

-- Change requests: Users can create and view their own requests, admins can view all
CREATE POLICY "Users can view their change requests" ON course_change_requests FOR SELECT USING (requested_by = auth.jwt() ->> 'email');
CREATE POLICY "Users can create change requests" ON course_change_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND requested_by = auth.jwt() ->> 'email');
CREATE POLICY "Admins can view all change requests" ON course_change_requests FOR SELECT USING (has_roles(ARRAY['admin', 'super_admin']));
CREATE POLICY "Admins can update change requests" ON course_change_requests FOR UPDATE USING (has_roles(ARRAY['admin', 'super_admin']));

-- Coach-student mappings policies
CREATE POLICY "Admins can manage coach-student mappings" ON public.coach_student_mappings FOR ALL USING (has_roles(ARRAY['admin', 'super_admin']));
DROP POLICY IF EXISTS "Coaches can view their own student mappings" ON public.coach_student_mappings;
CREATE POLICY "Coaches can view their own student mappings" ON public.coach_student_mappings FOR SELECT USING (
  coach_user_id = (
    SELECT user_id FROM public.user_profiles 
    WHERE email = COALESCE(current_setting('app.impersonated_user_email', true), auth.jwt() ->> 'email')
    LIMIT 1
  )
);

-- Coach notes policies
CREATE POLICY "Students can view their own notes" ON public.coach_notes FOR SELECT USING (
  student_id = (SELECT user_id FROM public.user_profiles WHERE email = auth.jwt() ->> 'email' LIMIT 1)
);

CREATE POLICY "Users can view relevant notes" ON public.coach_notes FOR SELECT USING (
  (student_id = auth.uid()) OR
  has_roles(ARRAY['coach'])
);

CREATE POLICY "Users can create notes or replies" ON public.coach_notes FOR INSERT WITH CHECK (
  author_id = auth.uid() AND (
    -- Coaches can create new top-level notes for any student
    (parent_note_id IS NULL AND has_roles(ARRAY['coach'])) OR
    -- Students can reply to their own threads, and coaches can reply to any thread
    (parent_note_id IS NOT NULL AND (student_id = auth.uid() OR has_roles(ARRAY['coach'])))
  )
);

CREATE POLICY "Users can update their own notes" ON public.coach_notes FOR UPDATE USING (
  author_id = auth.uid()
);

CREATE POLICY "Users can delete notes" ON public.coach_notes FOR DELETE USING (
  (author_id = auth.uid()) OR
  has_roles(ARRAY['coach']) OR
  has_roles(ARRAY['admin', 'super_admin'])
);

-- Rounds: Users can only access their own rounds
CREATE POLICY "Users can view their own rounds, super admins can view all" ON rounds FOR SELECT USING (user_email = COALESCE(current_setting('app.impersonated_user_email', true), auth.jwt() ->> 'email') OR is_my_student(user_email) OR has_roles(ARRAY['super_admin']));
CREATE POLICY "Users can create their own rounds, super admins can create for others" ON rounds FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (user_email = COALESCE(current_setting('app.impersonated_user_email', true), auth.jwt() ->> 'email') OR has_roles(ARRAY['super_admin'])));
CREATE POLICY "Users can update their own rounds, super admins can update all" ON rounds FOR UPDATE USING (user_email = COALESCE(current_setting('app.impersonated_user_email', true), auth.jwt() ->> 'email') OR has_roles(ARRAY['super_admin']));
CREATE POLICY "Users can delete their own rounds, super admins can delete all" ON rounds FOR DELETE USING (user_email = COALESCE(current_setting('app.impersonated_user_email', true), auth.jwt() ->> 'email') OR has_roles(ARRAY['super_admin']));

-- Round holes: Users can only access holes from their own rounds
CREATE POLICY "Users can view their own round holes" ON round_holes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM rounds 
    WHERE rounds.id = round_holes.round_id 
    AND (rounds.user_email = COALESCE(current_setting('app.impersonated_user_email', true), auth.jwt() ->> 'email') OR is_my_student(rounds.user_email) OR has_roles(ARRAY['super_admin']))
  )
);
CREATE POLICY "Users can create their own round holes" ON round_holes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM rounds 
    WHERE rounds.id = round_holes.round_id 
    AND (rounds.user_email = COALESCE(current_setting('app.impersonated_user_email', true), auth.jwt() ->> 'email') OR has_roles(ARRAY['super_admin']))
  )
);
CREATE POLICY "Users can update their own round holes" ON round_holes FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM rounds 
    WHERE rounds.id = round_holes.round_id 
    AND (rounds.user_email = COALESCE(current_setting('app.impersonated_user_email', true), auth.jwt() ->> 'email') OR has_roles(ARRAY['super_admin']))
  )
);
CREATE POLICY "Users can delete their own round holes" ON round_holes FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM rounds 
    WHERE rounds.id = round_holes.round_id 
    AND (rounds.user_email = COALESCE(current_setting('app.impersonated_user_email', true), auth.jwt() ->> 'email') OR has_roles(ARRAY['super_admin']))
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql' STABLE SET search_path = 'public';

-- Add triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON rounds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
SECURITY DEFINER -- This is important for accessing the auth.users table
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, roles, status)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name', -- Extracts full_name from user metadata
    ARRAY['user']::TEXT[], -- Default role as an array
    'active'  -- Set status to active for new sign-ups
  );
  RETURN new;
END;
$$;

-- Trigger to call the function after a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();