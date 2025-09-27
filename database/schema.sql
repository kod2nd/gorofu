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
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),
  country TEXT DEFAULT 'Singapore',
  handicap DECIMAL(3,1),
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
  course_id UUID NOT NULL REFERENCES courses(id),
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

-- Create indexes for better performance
CREATE INDEX idx_courses_country ON courses(country);
CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_course_tee_boxes_course_tee ON course_tee_boxes(course_id, tee_box);
CREATE INDEX idx_rounds_user_email ON rounds(user_email);
CREATE INDEX idx_rounds_course_date ON rounds(course_id, round_date);
CREATE INDEX idx_round_holes_round_id ON round_holes(round_id);

-- Helper function to get the role of the current user
-- This is used in RLS policies to avoid recursion
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM user_profiles WHERE user_id = auth.uid());
END;
$$;

-- Function to calculate the current SZIR streak for a user
CREATE OR REPLACE FUNCTION calculate_user_szir_streak(user_email_param TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
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
LANGUAGE plpgsql
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

-- Drop the function first to allow changing the return signature
DROP FUNCTION IF EXISTS public.get_user_cumulative_stats(TEXT, BOOLEAN); -- Keep this to ensure idempotency

-- Function to get cumulative (all-time) stats for a user
CREATE OR REPLACE FUNCTION get_user_cumulative_stats(user_email_param TEXT, eligible_rounds_only BOOLEAN)
RETURNS TABLE(total_rounds_played BIGINT, total_holes_played BIGINT, avg_score NUMERIC, avg_putts NUMERIC, total_szir BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT r.id)::BIGINT AS total_rounds_played,
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
        r.user_email = user_email_param
        AND (NOT eligible_rounds_only OR r.is_eligible_round = TRUE);
END;
$$;

-- Drop the function first to allow changing the return signature
DROP FUNCTION IF EXISTS public.get_recent_rounds_stats(TEXT, INT, BOOLEAN); -- Keep this to ensure idempotency

-- Function to get stats for a specific number of recent rounds
CREATE OR REPLACE FUNCTION get_recent_rounds_stats(user_email_param TEXT, round_limit INT, eligible_rounds_only BOOLEAN)
RETURNS TABLE(total_holes_played BIGINT, avg_par3_score NUMERIC, avg_par4_score NUMERIC, avg_par5_score NUMERIC, avg_putts_per_hole NUMERIC, szir_percentage NUMERIC, szir_count BIGINT, multi_putt_4ft_holes BIGINT, holeout_within_3_shots_count BIGINT, holeout_from_outside_4ft_count BIGINT, total_penalties BIGINT, avg_penalties_per_round NUMERIC, one_putt_count BIGINT, two_putt_count BIGINT, three_putt_plus_count BIGINT, birdie_or_better_count BIGINT, par_count BIGINT, bogey_count BIGINT, double_bogey_plus_count BIGINT, avg_putts_par3 NUMERIC, avg_putts_par4 NUMERIC, avg_putts_par5 NUMERIC, avg_score_with_szir NUMERIC, avg_score_without_szir NUMERIC, avg_score_with_szpar NUMERIC, avg_score_without_szpar NUMERIC, avg_score_with_szir_par3 NUMERIC, avg_score_with_szir_par4 NUMERIC, avg_score_with_szir_par5 NUMERIC, avg_score_without_szir_par3 NUMERIC, avg_score_without_szir_par4 NUMERIC, avg_score_without_szir_par5 NUMERIC, par3_birdie_or_better_count BIGINT, par3_par_count BIGINT, par3_bogey_count BIGINT, par3_double_bogey_plus_count BIGINT, par4_birdie_or_better_count BIGINT, par4_par_count BIGINT, par4_bogey_count BIGINT, par4_double_bogey_plus_count BIGINT, par5_birdie_or_better_count BIGINT, par5_par_count BIGINT, par5_bogey_count BIGINT, par5_double_bogey_plus_count BIGINT, avg_score_with_szpar_par3 NUMERIC, avg_score_without_szpar_par3 NUMERIC, avg_score_with_szpar_par4 NUMERIC, avg_score_without_szpar_par4 NUMERIC, avg_score_with_szpar_par5 NUMERIC, avg_score_without_szpar_par5 NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH recent_rounds AS (
        SELECT id
        FROM rounds
        WHERE
            user_email = user_email_param AND
            (NOT eligible_rounds_only OR is_eligible_round = TRUE)
        ORDER BY
            round_date DESC,
            created_at DESC
        LIMIT
            CASE WHEN round_limit > 0 THEN round_limit ELSE NULL END
    )
    SELECT
        COUNT(rh.id)::BIGINT,
        (AVG(rh.hole_score) FILTER (WHERE ctb.par = 3))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE ctb.par = 4))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE ctb.par = 5))::NUMERIC,
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
        COALESCE(SUM(CASE WHEN rh.hole_score < rh.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.hole_score = rh.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.hole_score = rh.par + 1 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN rh.hole_score >= rh.par + 2 THEN 1 ELSE 0 END), 0)::BIGINT,
        (AVG(rh.putts) FILTER (WHERE ctb.par = 3))::NUMERIC,
        (AVG(rh.putts) FILTER (WHERE ctb.par = 4))::NUMERIC,
        (AVG(rh.putts) FILTER (WHERE ctb.par = 5))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.scoring_zone_in_regulation IS TRUE))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.scoring_zone_in_regulation IS FALSE))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.holeout_within_3_shots_scoring_zone IS TRUE))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.holeout_within_3_shots_scoring_zone IS FALSE AND rh.scoring_zone_in_regulation IS TRUE))::NUMERIC, -- Avg score when SZ Par is missed
        (AVG(rh.hole_score) FILTER (WHERE rh.scoring_zone_in_regulation IS TRUE AND ctb.par = 3))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.scoring_zone_in_regulation IS TRUE AND ctb.par = 4))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.scoring_zone_in_regulation IS TRUE AND ctb.par = 5))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.scoring_zone_in_regulation IS FALSE AND ctb.par = 3))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.scoring_zone_in_regulation IS FALSE AND ctb.par = 4))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.scoring_zone_in_regulation IS FALSE AND ctb.par = 5))::NUMERIC,
        COALESCE(SUM(CASE WHEN ctb.par = 3 AND rh.hole_score < rh.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 3 AND rh.hole_score = rh.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 3 AND rh.hole_score = rh.par + 1 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 3 AND rh.hole_score >= rh.par + 2 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 4 AND rh.hole_score < rh.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 4 AND rh.hole_score = rh.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 4 AND rh.hole_score = rh.par + 1 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 4 AND rh.hole_score >= rh.par + 2 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 5 AND rh.hole_score < rh.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 5 AND rh.hole_score = rh.par THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 5 AND rh.hole_score = rh.par + 1 THEN 1 ELSE 0 END), 0)::BIGINT,
        COALESCE(SUM(CASE WHEN ctb.par = 5 AND rh.hole_score >= rh.par + 2 THEN 1 ELSE 0 END), 0)::BIGINT,
        (AVG(rh.hole_score) FILTER (WHERE rh.holeout_within_3_shots_scoring_zone IS TRUE AND ctb.par = 3))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.holeout_within_3_shots_scoring_zone IS FALSE AND rh.scoring_zone_in_regulation IS TRUE AND ctb.par = 3))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.holeout_within_3_shots_scoring_zone IS TRUE AND ctb.par = 4))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.holeout_within_3_shots_scoring_zone IS FALSE AND rh.scoring_zone_in_regulation IS TRUE AND ctb.par = 4))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.holeout_within_3_shots_scoring_zone IS TRUE AND ctb.par = 5))::NUMERIC,
        (AVG(rh.hole_score) FILTER (WHERE rh.holeout_within_3_shots_scoring_zone IS FALSE AND rh.scoring_zone_in_regulation IS TRUE AND ctb.par = 5))::NUMERIC
    FROM
        rounds r
    LEFT JOIN
        round_holes rh ON r.id = rh.round_id
    LEFT JOIN
        course_tee_boxes ctb ON r.course_id = ctb.course_id AND r.tee_box = ctb.tee_box AND rh.hole_number = ctb.hole_number
    WHERE
        r.id IN (SELECT id FROM recent_rounds);
END;
$$;

-- Grant execute permissions to the authenticated role for the new functions
-- This allows the functions to be called from the client-side library
GRANT EXECUTE ON FUNCTION public.calculate_user_szir_streak(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.calculate_user_szpar_streak(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_cumulative_stats(TEXT, BOOLEAN) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_recent_rounds_stats(TEXT, INT, BOOLEAN) TO authenticated, service_role;


-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_tee_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_holes ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can view their own profile, admins can view all
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (get_my_role() IN ('admin', 'super_admin'));
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can update any profile" ON user_profiles FOR UPDATE USING (get_my_role() IN ('admin', 'super_admin'));
CREATE POLICY "Admins can create profiles" ON user_profiles FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'super_admin'));

-- User invitations: Only admins can manage invitations
CREATE POLICY "Admins can view invitations" ON user_invitations FOR SELECT USING (get_my_role() IN ('admin', 'super_admin'));
CREATE POLICY "Admins can create invitations" ON user_invitations FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'super_admin'));
CREATE POLICY "Admins can update invitations" ON user_invitations FOR UPDATE USING (get_my_role() IN ('admin', 'super_admin'));

-- Audit log: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON user_audit_log FOR SELECT USING (get_my_role() IN ('admin', 'super_admin'));
CREATE POLICY "System can create audit logs" ON user_audit_log FOR INSERT WITH CHECK (true);

-- Courses: Everyone can read, authenticated users can create
CREATE POLICY "Anyone can view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create courses" ON courses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Course creators can update their courses" ON courses FOR UPDATE USING (created_by = auth.jwt() ->> 'email');

-- Course tee boxes: Everyone can read, authenticated users can create/update
CREATE POLICY "Anyone can view course tee boxes" ON course_tee_boxes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tee box data" ON course_tee_boxes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update tee box data they created" ON course_tee_boxes FOR UPDATE USING (last_updated_by = auth.jwt() ->> 'email');

-- Change requests: Users can create and view their own requests, admins can view all
CREATE POLICY "Users can view their change requests" ON course_change_requests FOR SELECT USING (requested_by = auth.jwt() ->> 'email');
CREATE POLICY "Users can create change requests" ON course_change_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND requested_by = auth.jwt() ->> 'email');
CREATE POLICY "Admins can view all change requests" ON course_change_requests FOR SELECT USING (get_my_role() IN ('admin', 'super_admin'));
CREATE POLICY "Admins can update change requests" ON course_change_requests FOR UPDATE USING (get_my_role() IN ('admin', 'super_admin'));

-- Rounds: Users can only access their own rounds
CREATE POLICY "Users can view their own rounds" ON rounds FOR SELECT USING (user_email = auth.jwt() ->> 'email');
CREATE POLICY "Users can create their own rounds" ON rounds FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND user_email = auth.jwt() ->> 'email');
CREATE POLICY "Users can update their own rounds" ON rounds FOR UPDATE USING (user_email = auth.jwt() ->> 'email');
CREATE POLICY "Users can delete their own rounds" ON rounds FOR DELETE USING (user_email = auth.jwt() ->> 'email');

-- Round holes: Users can only access holes from their own rounds
CREATE POLICY "Users can view their own round holes" ON round_holes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM rounds 
    WHERE rounds.id = round_holes.round_id 
    AND rounds.user_email = auth.jwt() ->> 'email'
  )
);
CREATE POLICY "Users can create their own round holes" ON round_holes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM rounds 
    WHERE rounds.id = round_holes.round_id 
    AND rounds.user_email = auth.jwt() ->> 'email'
  )
);
CREATE POLICY "Users can update their own round holes" ON round_holes FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM rounds 
    WHERE rounds.id = round_holes.round_id 
    AND rounds.user_email = auth.jwt() ->> 'email'
  )
);
CREATE POLICY "Users can delete their own round holes" ON round_holes FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM rounds 
    WHERE rounds.id = round_holes.round_id 
    AND rounds.user_email = auth.jwt() ->> 'email'
  )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rounds_updated_at BEFORE UPDATE ON rounds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();