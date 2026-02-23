-- Golf App Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================================================
-- CORE TABLES
-- =========================================================

-- User profiles table: Extended user information and roles
create table if not exists public.user_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique, -- References auth.users.id
  email text not null unique,
  full_name text,
  roles text[] not null default array['user']::text[],
  status text default 'pending' check (status in ('pending', 'active', 'suspended', 'inactive')),
  country text default 'Singapore',
  handicap decimal(3,1),
  scoring_bias integer default 1, -- 0=Par, 1=Bogey, 2=Double Bogey
  phone text,
  date_of_birth date,
  created_by text, -- email of admin who created/approved the user
  approved_at timestamptz,
  last_login timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User invitations table: For onboarding new users
create table if not exists public.user_invitations (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  invited_by text not null, -- email of admin who sent invitation
  role text default 'user' check (role in ('user', 'admin')),
  invitation_token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  status text default 'pending' check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  created_at timestamptz default now()
);

-- Audit log for user management actions
create table if not exists public.user_audit_log (
  id uuid primary key default uuid_generate_v4(),
  target_user_email text not null,
  action text not null, -- 'created', 'updated', 'suspended', 'activated', 'role_changed', etc.
  performed_by text not null, -- email of admin who performed the action
  old_values jsonb,
  new_values jsonb,
  notes text,
  created_at timestamptz default now()
);

-- Courses table: Master course data shared among all users
create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text default 'Singapore',
  city text,
  created_by text not null, -- email of user who first added the course
  is_verified boolean default false, -- admin verified course data
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_course_per_country unique(name, country)
);

-- Course tee boxes: Hole distances and pars per tee box
create table if not exists public.course_tee_boxes (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  tee_box text not null,
  hole_number integer not null check (hole_number >= 1 and hole_number <= 18),
  par integer check (par >= 2 and par <= 7),
  distance integer check (distance > 0),
  yards_or_meters_unit text default 'yards' check (yards_or_meters_unit in ('yards', 'meters')),
  last_updated_by text not null, -- email of user who last updated this hole
  last_updated_at timestamptz default now(),
  created_at timestamptz default now(),
  constraint unique_hole_per_tee_box unique(course_id, tee_box, hole_number)
);

-- Course change requests: Maker-checker workflow for course updates
create table if not exists public.course_change_requests (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  tee_box text not null,
  hole_number integer not null check (hole_number >= 1 and hole_number <= 18),
  current_par integer,
  current_distance integer,
  proposed_par integer,
  proposed_distance integer,
  current_yards_or_meters_unit text,
  proposed_yards_or_meters_unit text,
  requested_by text not null, -- email of requesting user
  reason text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text, -- email of admin who reviewed
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz default now()
);

-- Rounds table: Round-level data
create table if not exists public.rounds (
  id uuid primary key default uuid_generate_v4(),
  user_email text not null,
  course_id uuid not null references public.courses(id) on delete cascade,
  tee_box text not null,
  round_date date not null,
  round_type text default '18_holes' check (round_type in ('front_9', 'back_9', '18_holes')),
  scoring_zone_level text not null,
  total_holes_played integer default 0,
  total_score integer default 0,
  total_putts integer default 0,
  total_penalties integer default 0,
  is_eligible_round boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Round holes table: Actual performance data per hole
create table if not exists public.round_holes (
  id uuid primary key default uuid_generate_v4(),
  round_id uuid not null references public.rounds(id) on delete cascade,
  hole_number integer not null check (hole_number >= 1 and hole_number <= 18),
  hole_score integer check (hole_score > 0),
  putts integer check (putts >= 0),
  putts_within4ft integer default 0 check (putts_within4ft >= 0),
  penalty_shots integer default 0 check (penalty_shots >= 0),
  scoring_zone_in_regulation boolean default false,
  holeout_from_outside_4ft boolean default false,
  holeout_within_3_shots_scoring_zone boolean default false,
  bad_habits text[] default '{}',
  par integer check (par >= 2 and par <= 7),
  distance integer check (distance > 0),
  created_at timestamptz default now(),
  constraint unique_hole_per_round unique(round_id, hole_number)
);

-- Coach/student mapping
create table if not exists public.coach_student_mappings (
  id uuid primary key default uuid_generate_v4(),
  coach_user_id uuid not null,
  student_user_id uuid not null,
  constraint fk_coach foreign key (coach_user_id) references public.user_profiles(user_id) on delete cascade,
  constraint fk_student foreign key (student_user_id) references public.user_profiles(user_id) on delete cascade,
  created_at timestamptz default now(),
  constraint unique_coach_student unique (coach_user_id, student_user_id)
);

-- Coach notes (threads + replies)
create table if not exists public.coach_notes (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null,
  student_id uuid not null,
  parent_note_id uuid references public.coach_notes(id) on delete cascade,
  note text not null,
  subject text,
  lesson_date timestamptz,
  is_favorited boolean default false,
  is_pinned_to_dashboard boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint fk_author_note foreign key (author_id) references public.user_profiles(user_id) on delete cascade,
  constraint fk_student_note foreign key (student_id) references public.user_profiles(user_id) on delete cascade
);

-- =========================================================
-- INTERNAL SCHEMA + UNRESTRICTED VIEW
-- =========================================================

create schema if not exists internal;

create or replace view internal.user_profiles_unrestricted as
select * from public.user_profiles;

grant select on internal.user_profiles_unrestricted to postgres;

-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists idx_courses_country on public.courses(country);
create index if not exists idx_courses_name on public.courses(name);
create index if not exists idx_course_tee_boxes_course_tee on public.course_tee_boxes(course_id, tee_box);
create index if not exists idx_rounds_user_email on public.rounds(user_email);
create index if not exists idx_rounds_course_date on public.rounds(course_id, round_date);
create index if not exists idx_round_holes_round_id on public.round_holes(round_id);
create index if not exists idx_course_change_requests_course_id on public.course_change_requests(course_id);

-- =========================================================
-- IMPERSONATION-AWARE HELPERS
-- (Supports BOTH session GUC and JWT user_metadata.impersonatedUser)
-- =========================================================

create or replace function public.has_roles(roles_to_check text[])
returns boolean
language plpgsql
security definer
set search_path = internal, public
as $$
declare
  user_roles_array text[];
  impersonated_email text;
begin
  impersonated_email :=
    coalesce(
      nullif(current_setting('app.impersonated_user_email', true), ''),
      nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
      nullif((auth.jwt() ->> 'impersonatedUser'), '')
    );

  if impersonated_email is not null then
    select roles
      into user_roles_array
      from internal.user_profiles_unrestricted
     where email = impersonated_email;
  else
    select roles
      into user_roles_array
      from internal.user_profiles_unrestricted
     where user_id = auth.uid();
  end if;

  return user_roles_array && roles_to_check;
end;
$$;

create or replace function public.get_my_roles()
returns text[]
language plpgsql
security definer
set search_path = internal, public
as $$
declare
  impersonated_email text;
begin
  impersonated_email :=
    coalesce(
      nullif(current_setting('app.impersonated_user_email', true), ''),
      nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
      nullif((auth.jwt() ->> 'impersonatedUser'), '')
    );

  if impersonated_email is not null then
    return (
      select roles
        from internal.user_profiles_unrestricted
       where email = impersonated_email
    );
  end if;

  return (
    select roles
      from internal.user_profiles_unrestricted
     where user_id = auth.uid()
  );
end;
$$;

create or replace function public.get_current_user_id()
returns uuid
language plpgsql
stable
security definer
set search_path = internal, public
as $$
declare
  impersonated_email text;
  user_id_to_return uuid;
begin
  impersonated_email :=
    coalesce(
      nullif(current_setting('app.impersonated_user_email', true), ''),
      nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
      nullif((auth.jwt() ->> 'impersonatedUser'), '')
    );

  if impersonated_email is not null then
    select user_id
      into user_id_to_return
      from internal.user_profiles_unrestricted
     where email = impersonated_email;

    return user_id_to_return;
  end if;

  return auth.uid();
end;
$$;

create or replace function public.is_coach_viewing_authorized()
returns boolean
language plpgsql
stable
security definer
set search_path = internal, public
as $$
declare
  current_user_email text;
  user_roles_array text[];
begin
  current_user_email :=
    coalesce(
      nullif(current_setting('app.impersonated_user_email', true), ''),
      nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
      nullif((auth.jwt() ->> 'impersonatedUser'), ''),
      auth.jwt() ->> 'email'
    );

  if current_user_email is null then
    return false;
  end if;

  select roles
    into user_roles_array
    from internal.user_profiles_unrestricted
   where email = current_user_email;

  return 'coach' = any(user_roles_array);
end;
$$;

create or replace function public.is_my_student(student_email_to_check text)
returns boolean
language plpgsql
stable
security definer
set search_path = internal, public
as $$
declare
  active_user_id uuid;
  is_student boolean;
  effective_email text;
begin
  effective_email :=
    coalesce(
      nullif(current_setting('app.impersonated_user_email', true), ''),
      nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
      nullif((auth.jwt() ->> 'impersonatedUser'), ''),
      auth.jwt() ->> 'email'
    );

  select user_id
    into active_user_id
    from internal.user_profiles_unrestricted
   where email = effective_email
   limit 1;

  if active_user_id is null then
    return false;
  end if;

  if not (select 'coach' = any(roles) from internal.user_profiles_unrestricted where user_id = active_user_id) then
    return false;
  end if;

  select exists (
    select 1
      from public.coach_student_mappings csm
      join internal.user_profiles_unrestricted sp on csm.student_user_id = sp.user_id
     where csm.coach_user_id = active_user_id
       and sp.email = student_email_to_check
  ) into is_student;

  return is_student;
end;
$$;

-- =========================================================
-- STATS / SEARCH FUNCTIONS (unchanged from your version)
-- =========================================================

create or replace function public.calculate_user_szir_streak(user_email_param text)
returns integer
language plpgsql
stable
set search_path = public
as $$
declare
  streak_count integer := 0;
  hole_record record;
begin
  for hole_record in
    select rh.scoring_zone_in_regulation
      from public.round_holes rh
      join public.rounds r on rh.round_id = r.id
     where r.user_email = user_email_param
     order by r.round_date desc, rh.hole_number desc
  loop
    if hole_record.scoring_zone_in_regulation then
      streak_count := streak_count + 1;
    else
      exit;
    end if;
  end loop;

  return streak_count;
end;
$$;

create or replace function public.calculate_user_szpar_streak(user_email_param text)
returns integer
language plpgsql
stable
set search_path = public
as $$
declare
  streak_count integer := 0;
  hole_record record;
begin
  for hole_record in
    select rh.holeout_within_3_shots_scoring_zone
      from public.round_holes rh
      join public.rounds r on rh.round_id = r.id
     where r.user_email = user_email_param
       and rh.scoring_zone_in_regulation = true
     order by r.round_date desc, rh.hole_number desc
  loop
    if hole_record.holeout_within_3_shots_scoring_zone then
      streak_count := streak_count + 1;
    else
      exit;
    end if;
  end loop;

  return streak_count;
end;
$$;

create or replace function public.search_courses_with_stats(
  search_term text default '',
  country_filter text default null
)
returns table(
  id uuid,
  name text,
  country text,
  city text,
  tee_box_stats jsonb
)
language plpgsql
stable
as $$
begin
  return query
  select
    c.id,
    c.name,
    c.country,
    c.city,
    (
      select jsonb_agg(tbs)
      from (
        select tee_box,
               count(hole_number) as hole_count,
               sum(par) as total_par,
               sum(distance) as total_distance,
               max(yards_or_meters_unit) as yards_or_meters_unit
          from public.course_tee_boxes ctb
         where ctb.course_id = c.id
         group by tee_box
      ) tbs
    ) as tee_box_stats
  from public.courses c
  where (country_filter is null or c.country = country_filter)
    and (search_term = '' or c.name ilike '%' || search_term || '%')
  order by c.name;
end;
$$;

drop function if exists public.get_user_cumulative_stats(text);

create or replace function public.get_user_cumulative_stats(user_email_param text)
returns table(
  total_rounds_played bigint,
  eligible_rounds_count bigint,
  total_holes_played bigint,
  avg_score numeric,
  avg_putts numeric,
  total_szir bigint
)
language plpgsql
stable
set search_path = public
as $$
begin
  return query
  select
    count(distinct r.id)::bigint as total_rounds_played,
    coalesce(count(distinct r.id) filter (where r.is_eligible_round = true), 0)::bigint as eligible_rounds_count,
    coalesce(sum(case when rh.hole_score is not null and rh.putts is not null then 1 else 0 end), 0)::bigint as total_holes_played,
    coalesce(avg(rh.hole_score), 0)::numeric as avg_score,
    coalesce(avg(rh.putts), 0)::numeric as avg_putts,
    coalesce(sum(case when rh.scoring_zone_in_regulation then 1 else 0 end), 0)::bigint as total_szir
  from public.rounds r
  left join public.round_holes rh on r.id = rh.round_id
  where r.user_email = user_email_param;
end;
$$;

drop function if exists public.get_recent_rounds_base_stats(text, integer, boolean);

create or replace function public.get_recent_rounds_base_stats(user_email_param text, round_limit int, eligible_rounds_only boolean)
returns table (
  total_holes_played bigint,
  avg_putts_per_hole numeric,
  szir_percentage numeric,
  szir_count bigint,
  multi_putt_4ft_holes bigint,
  holeout_within_3_shots_count bigint,
  holeout_from_outside_4ft_count bigint,
  total_penalties bigint,
  avg_penalties_per_round numeric,
  one_putt_count bigint,
  two_putt_count bigint,
  three_putt_plus_count bigint,
  birdie_or_better_count bigint,
  par_count bigint,
  bogey_count bigint,
  double_bogey_count bigint,
  triple_bogey_plus_count bigint
)
language plpgsql
stable
set search_path = public
as $$
begin
  return query
  with recent_rounds as (
    select id
      from public.rounds
     where user_email = user_email_param
       and (not eligible_rounds_only or is_eligible_round = true)
     order by round_date desc, created_at desc
     limit case when round_limit > 0 then round_limit else null end
  )
  select
    count(rh.id)::bigint,
    coalesce(avg(rh.putts), 0)::numeric,
    (case when count(rh.id) > 0 then (sum(case when rh.scoring_zone_in_regulation then 1 else 0 end)::numeric / nullif(count(rh.id), 0) * 100) else 0 end)::numeric,
    coalesce(sum(case when rh.scoring_zone_in_regulation then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when rh.putts_within4ft > 1 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when rh.holeout_within_3_shots_scoring_zone then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when rh.holeout_from_outside_4ft then 1 else 0 end), 0)::bigint,
    coalesce(sum(rh.penalty_shots), 0)::bigint,
    (case when count(distinct r.id) > 0 then sum(rh.penalty_shots)::numeric / nullif(count(distinct r.id), 0) else 0 end)::numeric,
    coalesce(sum(case when rh.putts = 1 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when rh.putts = 2 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when rh.putts >= 3 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when rh.hole_score < ctb.par then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when rh.hole_score = ctb.par then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when rh.hole_score = ctb.par + 1 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when rh.hole_score = ctb.par + 2 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when rh.hole_score >= ctb.par + 3 then 1 else 0 end), 0)::bigint
  from public.rounds r
  join public.round_holes rh on r.id = rh.round_id
  join public.course_tee_boxes ctb on r.course_id = ctb.course_id and r.tee_box = ctb.tee_box and rh.hole_number = ctb.hole_number
  where r.id in (select id from recent_rounds);
end;
$$;

create or replace function public.get_recent_rounds_par_type_stats(user_email_param text, round_limit int, eligible_rounds_only boolean)
returns table (
  avg_par3_score numeric,
  avg_par4_score numeric,
  avg_par5_score numeric,
  avg_putts_par3 numeric,
  avg_putts_par4 numeric,
  avg_putts_par5 numeric,
  par3_birdie_or_better_count bigint, par3_par_count bigint, par3_bogey_count bigint, par3_double_bogey_count bigint, par3_triple_bogey_plus_count bigint,
  par4_birdie_or_better_count bigint, par4_par_count bigint, par4_bogey_count bigint, par4_double_bogey_count bigint, par4_triple_bogey_plus_count bigint,
  par5_birdie_or_better_count bigint, par5_par_count bigint, par5_bogey_count bigint, par5_double_bogey_count bigint, par5_triple_bogey_plus_count bigint
)
language plpgsql
stable
set search_path = public
as $$
begin
  return query
  with recent_rounds as (
    select id
      from public.rounds
     where user_email = user_email_param
       and (not eligible_rounds_only or is_eligible_round = true)
     order by round_date desc, created_at desc
     limit case when round_limit > 0 then round_limit else null end
  )
  select
    (avg(rh.hole_score) filter (where ctb.par = 3))::numeric,
    (avg(rh.hole_score) filter (where ctb.par = 4))::numeric,
    (avg(rh.hole_score) filter (where ctb.par = 5))::numeric,
    (avg(rh.putts) filter (where ctb.par = 3))::numeric,
    (avg(rh.putts) filter (where ctb.par = 4))::numeric,
    (avg(rh.putts) filter (where ctb.par = 5))::numeric,

    coalesce(sum(case when ctb.par = 3 and rh.hole_score < ctb.par then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 3 and rh.hole_score = ctb.par then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 3 and rh.hole_score = ctb.par + 1 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 3 and rh.hole_score = ctb.par + 2 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 3 and rh.hole_score >= ctb.par + 3 then 1 else 0 end), 0)::bigint,

    coalesce(sum(case when ctb.par = 4 and rh.hole_score < ctb.par then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 4 and rh.hole_score = ctb.par then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 4 and rh.hole_score = ctb.par + 1 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 4 and rh.hole_score = ctb.par + 2 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 4 and rh.hole_score >= ctb.par + 3 then 1 else 0 end), 0)::bigint,

    coalesce(sum(case when ctb.par = 5 and rh.hole_score < ctb.par then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 5 and rh.hole_score = ctb.par then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 5 and rh.hole_score = ctb.par + 1 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 5 and rh.hole_score = ctb.par + 2 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ctb.par = 5 and rh.hole_score >= ctb.par + 3 then 1 else 0 end), 0)::bigint
  from public.rounds r
  join public.round_holes rh on r.id = rh.round_id
  join public.course_tee_boxes ctb on r.course_id = ctb.course_id and r.tee_box = ctb.tee_box and rh.hole_number = ctb.hole_number
  where r.id in (select id from recent_rounds);
end;
$$;

drop function if exists public.get_recent_rounds_advanced_stats(text, integer, boolean, numeric);

create or replace function public.get_recent_rounds_advanced_stats(
  user_email_param text,
  round_limit int,
  eligible_rounds_only boolean,
  relative_distance_threshold numeric default 0.15
)
returns table (
  avg_score_with_szir numeric,
  avg_score_without_szir numeric,
  avg_score_with_szpar numeric,
  avg_score_without_szpar numeric,
  avg_score_with_szir_par3 numeric, avg_score_with_szir_par4 numeric, avg_score_with_szir_par5 numeric,
  avg_score_without_szir_par3 numeric, avg_score_without_szir_par4 numeric, avg_score_without_szir_par5 numeric,
  avg_score_with_szpar_par3 numeric, avg_score_without_szpar_par3 numeric, avg_score_with_szpar_par4 numeric,
  avg_score_without_szpar_par4 numeric, avg_score_with_szpar_par5 numeric, avg_score_without_szpar_par5 numeric,
  avg_score_with_penalty_par3 numeric, avg_score_without_penalty_par3 numeric, avg_score_with_penalty_par4 numeric,
  avg_score_without_penalty_par4 numeric, avg_score_with_penalty_par5 numeric, avg_score_without_penalty_par5 numeric,
  penalty_on_par3_count bigint, penalty_on_par4_count bigint, penalty_on_par5_count bigint,
  luck_on_par3_count bigint, luck_on_par4_count bigint, luck_on_par5_count bigint,
  total_par3_holes bigint, total_par4_holes bigint, total_par5_holes bigint,
  luck_with_szir_count bigint, luck_without_szir_count bigint,
  total_szir_holes bigint, total_non_szir_holes bigint,
  avg_dist_par3 numeric, avg_dist_par4 numeric, avg_dist_par5 numeric,
  avg_score_short_par3 numeric, avg_score_medium_par3 numeric, avg_score_long_par3 numeric,
  avg_score_short_par4 numeric, avg_score_medium_par4 numeric, avg_score_long_par4 numeric,
  avg_score_short_par5 numeric, avg_score_medium_par5 numeric, avg_score_long_par5 numeric
)
language plpgsql
stable
set search_path = public
as $$
begin
  return query
  with recent_rounds as (
    select id
      from public.rounds
     where user_email = user_email_param
       and (not eligible_rounds_only or is_eligible_round = true)
     order by round_date desc, created_at desc
     limit case when round_limit > 0 then round_limit else null end
  ),
  all_holes as (
    select
      rh.hole_score,
      rh.scoring_zone_in_regulation,
      rh.holeout_within_3_shots_scoring_zone,
      rh.penalty_shots,
      rh.holeout_from_outside_4ft,
      ctb.par as course_par,
      ctb.distance as course_distance
    from public.round_holes rh
    join public.rounds r on rh.round_id = r.id
    join public.course_tee_boxes ctb
      on r.course_id = ctb.course_id
     and r.tee_box = ctb.tee_box
     and rh.hole_number = ctb.hole_number
    where r.id in (select id from recent_rounds)
  ),
  avg_distances as (
    select
      coalesce(avg(course_distance) filter (where course_par = 3), 0) as avg_d_p3,
      coalesce(avg(course_distance) filter (where course_par = 4), 0) as avg_d_p4,
      coalesce(avg(course_distance) filter (where course_par = 5), 0) as avg_d_p5
    from all_holes
  )
  select
    (avg(ah.hole_score) filter (where ah.scoring_zone_in_regulation is true))::numeric,
    (avg(ah.hole_score) filter (where ah.scoring_zone_in_regulation is false))::numeric,
    (avg(ah.hole_score) filter (where ah.holeout_within_3_shots_scoring_zone is true))::numeric,
    (avg(ah.hole_score) filter (where ah.holeout_within_3_shots_scoring_zone is false and ah.scoring_zone_in_regulation is true))::numeric,

    (avg(ah.hole_score) filter (where ah.scoring_zone_in_regulation is true and ah.course_par = 3))::numeric,
    (avg(ah.hole_score) filter (where ah.scoring_zone_in_regulation is true and ah.course_par = 4))::numeric,
    (avg(ah.hole_score) filter (where ah.scoring_zone_in_regulation is true and ah.course_par = 5))::numeric,

    (avg(ah.hole_score) filter (where ah.scoring_zone_in_regulation is false and ah.course_par = 3))::numeric,
    (avg(ah.hole_score) filter (where ah.scoring_zone_in_regulation is false and ah.course_par = 4))::numeric,
    (avg(ah.hole_score) filter (where ah.scoring_zone_in_regulation is false and ah.course_par = 5))::numeric,

    (avg(ah.hole_score) filter (where ah.holeout_within_3_shots_scoring_zone is true and ah.course_par = 3))::numeric,
    (avg(ah.hole_score) filter (where ah.holeout_within_3_shots_scoring_zone is false and ah.scoring_zone_in_regulation is true and ah.course_par = 3))::numeric,
    (avg(ah.hole_score) filter (where ah.holeout_within_3_shots_scoring_zone is true and ah.course_par = 4))::numeric,
    (avg(ah.hole_score) filter (where ah.holeout_within_3_shots_scoring_zone is false and ah.scoring_zone_in_regulation is true and ah.course_par = 4))::numeric,
    (avg(ah.hole_score) filter (where ah.holeout_within_3_shots_scoring_zone is true and ah.course_par = 5))::numeric,
    (avg(ah.hole_score) filter (where ah.holeout_within_3_shots_scoring_zone is false and ah.scoring_zone_in_regulation is true and ah.course_par = 5))::numeric,

    (avg(ah.hole_score) filter (where ah.penalty_shots > 0 and ah.course_par = 3))::numeric,
    (avg(ah.hole_score) filter (where ah.penalty_shots = 0 and ah.course_par = 3))::numeric,
    (avg(ah.hole_score) filter (where ah.penalty_shots > 0 and ah.course_par = 4))::numeric,
    (avg(ah.hole_score) filter (where ah.penalty_shots = 0 and ah.course_par = 4))::numeric,
    (avg(ah.hole_score) filter (where ah.penalty_shots > 0 and ah.course_par = 5))::numeric,
    (avg(ah.hole_score) filter (where ah.penalty_shots = 0 and ah.course_par = 5))::numeric,

    coalesce(sum(case when ah.course_par = 3 and ah.penalty_shots > 0 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ah.course_par = 4 and ah.penalty_shots > 0 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ah.course_par = 5 and ah.penalty_shots > 0 then 1 else 0 end), 0)::bigint,

    coalesce(sum(case when ah.course_par = 3 and ah.holeout_from_outside_4ft then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ah.course_par = 4 and ah.holeout_from_outside_4ft then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ah.course_par = 5 and ah.holeout_from_outside_4ft then 1 else 0 end), 0)::bigint,

    coalesce(sum(case when ah.course_par = 3 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ah.course_par = 4 then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ah.course_par = 5 then 1 else 0 end), 0)::bigint,

    coalesce(sum(case when ah.scoring_zone_in_regulation is true and ah.holeout_from_outside_4ft then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ah.scoring_zone_in_regulation is false and ah.holeout_from_outside_4ft then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ah.scoring_zone_in_regulation is true then 1 else 0 end), 0)::bigint,
    coalesce(sum(case when ah.scoring_zone_in_regulation is false then 1 else 0 end), 0)::bigint,

    max(ad.avg_d_p3), max(ad.avg_d_p4), max(ad.avg_d_p5),

    (avg(ah.hole_score) filter (where ah.course_par = 3 and ah.course_distance < ad.avg_d_p3 * (1 - relative_distance_threshold)))::numeric,
    (avg(ah.hole_score) filter (where ah.course_par = 3 and ah.course_distance >= ad.avg_d_p3 * (1 - relative_distance_threshold) and ah.course_distance <= ad.avg_d_p3 * (1 + relative_distance_threshold)))::numeric,
    (avg(ah.hole_score) filter (where ah.course_par = 3 and ah.course_distance > ad.avg_d_p3 * (1 + relative_distance_threshold)))::numeric,

    (avg(ah.hole_score) filter (where ah.course_par = 4 and ah.course_distance < ad.avg_d_p4 * (1 - relative_distance_threshold)))::numeric,
    (avg(ah.hole_score) filter (where ah.course_par = 4 and ah.course_distance >= ad.avg_d_p4 * (1 - relative_distance_threshold) and ah.course_distance <= ad.avg_d_p4 * (1 + relative_distance_threshold)))::numeric,
    (avg(ah.hole_score) filter (where ah.course_par = 4 and ah.course_distance > ad.avg_d_p4 * (1 + relative_distance_threshold)))::numeric,

    (avg(ah.hole_score) filter (where ah.course_par = 5 and ah.course_distance < ad.avg_d_p5 * (1 - relative_distance_threshold)))::numeric,
    (avg(ah.hole_score) filter (where ah.course_par = 5 and ah.course_distance >= ad.avg_d_p5 * (1 - relative_distance_threshold) and ah.course_distance <= ad.avg_d_p5 * (1 + relative_distance_threshold)))::numeric,
    (avg(ah.hole_score) filter (where ah.course_par = 5 and ah.course_distance > ad.avg_d_p5 * (1 + relative_distance_threshold)))::numeric
  from all_holes ah, avg_distances ad;
end;
$$;

-- Grants
grant execute on function public.calculate_user_szir_streak(text) to authenticated, service_role;
grant execute on function public.calculate_user_szpar_streak(text) to authenticated, service_role;
grant execute on function public.get_user_cumulative_stats(text) to authenticated, service_role;
grant execute on function public.get_recent_rounds_base_stats(text, int, boolean) to authenticated, service_role;
grant execute on function public.get_recent_rounds_par_type_stats(text, int, boolean) to authenticated, service_role;
grant execute on function public.get_recent_rounds_advanced_stats(text, int, boolean, numeric) to authenticated, service_role;
grant execute on function public.search_courses_with_stats(text, text) to authenticated, service_role;
grant execute on function extensions.uuid_generate_v4() to authenticated, service_role;

-- =========================================================
-- IMPERSONATION SET/CLEAR FUNCTIONS (kept)
-- =========================================================

create or replace function public.set_impersonation(user_email_to_impersonate text)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (select 'super_admin' = any(roles) from public.user_profiles where user_id = auth.uid()) then
    raise exception 'Only super_admins can impersonate users.';
  end if;

  perform set_config('app.impersonated_user_email', user_email_to_impersonate, false);

  return 'Impersonating ' || user_email_to_impersonate;
end;
$$;

create or replace function public.clear_impersonation()
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.impersonated_user_email', '', false);
  return 'Impersonation stopped.';
end;
$$;

grant execute on function public.set_impersonation(text) to authenticated, service_role;
grant execute on function public.clear_impersonation() to authenticated, service_role;

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
stable
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_courses_updated_at on public.courses;
create trigger update_courses_updated_at
before update on public.courses
for each row execute function public.update_updated_at_column();

drop trigger if exists update_rounds_updated_at on public.rounds;
create trigger update_rounds_updated_at
before update on public.rounds
for each row execute function public.update_updated_at_column();

-- =========================================================
-- MY BAG TABLES
-- =========================================================

create table if not exists public.user_shot_types (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category_ids text[] not null,
  is_default boolean default false,
  created_at timestamptz default now(),
  constraint unique_shot_type_name_for_user unique (user_id, name)
);

create table if not exists public.clubs (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text,
  make text,
  model text,
  loft text,
  bounce text,
  shaft_make text,
  shaft_model text,
  shaft_flex text,
  shaft_weight text,
  shaft_length text,
  grip_make text,
  grip_model text,
  grip_size text,
  grip_weight text,
  swing_weight text,
  created_at timestamptz default now()
);

create table if not exists public.shots (
  id bigint generated by default as identity primary key,
  club_id bigint references public.clubs(id) on delete cascade not null,
  shot_type text not null,
  carry_min numeric,
  carry_typical numeric,
  carry_max numeric,
  total_min numeric,
  total_typical numeric,
  total_max numeric,
  launch text,
  roll text,
  unit text not null default 'yards',
  tendency text,
  swing_key text,
  created_at timestamptz default now(),

  constraint shots_carry_range_order_chk
    check (
      carry_min is null or carry_typical is null or carry_max is null
      or (carry_min <= carry_typical and carry_typical <= carry_max)
    ),

  constraint shots_total_range_order_chk
    check (
      total_min is null or total_typical is null or total_max is null
      or (total_min <= total_typical and total_typical <= total_max)
    )
);

create table if not exists public.bags (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  is_default boolean default false,
  tags text[],
  created_at timestamptz default now()
);

create table if not exists public.bag_clubs (
  bag_id bigint references public.bags(id) on delete cascade not null,
  club_id bigint references public.clubs(id) on delete cascade not null,
  primary key (bag_id, club_id)
);

-- =========================================================
-- AUTH SIGNUP TRIGGER (ONLY ONCE)
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email, full_name, roles, status)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', array['user']::text[], 'active');

  -- Seed default shot types
  insert into public.user_shot_types (user_id, name, category_ids, is_default)
  values
    (new.id, 'Full', array['cat_long'], true),
    (new.id, '3/4 Swing', array['cat_long', 'cat_approach'], true),
    (new.id, '1/2 Swing', array['cat_approach', 'cat_short'], true),
    (new.id, 'Pitch', array['cat_short'], true),
    (new.id, 'Chip', array['cat_short'], true);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================================================
-- RLS ENABLE
-- =========================================================

alter table public.user_profiles enable row level security;
alter table public.user_invitations enable row level security;
alter table public.user_audit_log enable row level security;
alter table public.courses enable row level security;
alter table public.course_tee_boxes enable row level security;
alter table public.course_change_requests enable row level security;
alter table public.rounds enable row level security;
alter table public.round_holes enable row level security;
alter table public.coach_student_mappings enable row level security;
alter table public.coach_notes enable row level security;

alter table public.user_shot_types enable row level security;
alter table public.clubs enable row level security;
alter table public.shots enable row level security;
alter table public.bags enable row level security;
alter table public.bag_clubs enable row level security;

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- User profiles
drop policy if exists "Users can view their own profile" on public.user_profiles;
create policy "Users can view their own profile"
on public.user_profiles
for select
using (user_id = auth.uid());

drop policy if exists "Admins can view all profiles" on public.user_profiles;
create policy "Admins can view all profiles"
on public.user_profiles
for select
using (public.has_roles(array['admin','super_admin']));

drop policy if exists "Users can update their own profile" on public.user_profiles;
create policy "Users can update their own profile"
on public.user_profiles
for update
using (user_id = auth.uid());

drop policy if exists "Coaches can view relevant user profiles" on public.user_profiles;
create policy "Coaches can view relevant user profiles"
on public.user_profiles
for select
using (
  public.has_roles(array['coach']) and (
    user_id = auth.uid()
    or 'coach' = any(roles)
    or exists (select 1 from public.coach_student_mappings where student_user_id = public.user_profiles.user_id)
  )
);

drop policy if exists "Admins can update any profile" on public.user_profiles;
create policy "Admins can update any profile"
on public.user_profiles
for update
using (public.has_roles(array['admin','super_admin']));

drop policy if exists "Admins can create profiles" on public.user_profiles;
create policy "Admins can create profiles"
on public.user_profiles
for insert
with check (public.has_roles(array['admin','super_admin']));

-- Invitations
drop policy if exists "Admins can view invitations" on public.user_invitations;
create policy "Admins can view invitations"
on public.user_invitations
for select
using (public.has_roles(array['admin','super_admin']));

drop policy if exists "Admins can create invitations" on public.user_invitations;
create policy "Admins can create invitations"
on public.user_invitations
for insert
with check (public.has_roles(array['admin','super_admin']));

drop policy if exists "Admins can update invitations" on public.user_invitations;
create policy "Admins can update invitations"
on public.user_invitations
for update
using (public.has_roles(array['admin','super_admin']));

-- Audit log
drop policy if exists "Admins can view audit logs" on public.user_audit_log;
create policy "Admins can view audit logs"
on public.user_audit_log
for select
using (public.has_roles(array['admin','super_admin']));

drop policy if exists "System can create audit logs" on public.user_audit_log;
create policy "System can create audit logs"
on public.user_audit_log
for insert
with check (true);

-- Courses
drop policy if exists "Anyone can view courses" on public.courses;
create policy "Anyone can view courses"
on public.courses
for select
using (true);

drop policy if exists "Authenticated users can create courses" on public.courses;
create policy "Authenticated users can create courses"
on public.courses
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Course creators can update their courses" on public.courses;
create policy "Course creators can update their courses"
on public.courses
for update
using (created_by = auth.jwt() ->> 'email');

drop policy if exists "Admins can delete courses" on public.courses;
create policy "Admins can delete courses"
on public.courses
for delete
using (public.has_roles(array['admin','super_admin']));

-- Course tee boxes
drop policy if exists "Anyone can view course tee boxes" on public.course_tee_boxes;
create policy "Anyone can view course tee boxes"
on public.course_tee_boxes
for select
using (true);

drop policy if exists "Authenticated users can create tee box data" on public.course_tee_boxes;
create policy "Authenticated users can create tee box data"
on public.course_tee_boxes
for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Users can update tee box data they created" on public.course_tee_boxes;
create policy "Users can update tee box data they created"
on public.course_tee_boxes
for update
using (auth.role() = 'authenticated');

-- Change requests
drop policy if exists "Users can view their change requests" on public.course_change_requests;
create policy "Users can view their change requests"
on public.course_change_requests
for select
using (requested_by = auth.jwt() ->> 'email');

drop policy if exists "Users can create change requests" on public.course_change_requests;
create policy "Users can create change requests"
on public.course_change_requests
for insert
with check (auth.role() = 'authenticated' and requested_by = auth.jwt() ->> 'email');

drop policy if exists "Admins can view all change requests" on public.course_change_requests;
create policy "Admins can view all change requests"
on public.course_change_requests
for select
using (public.has_roles(array['admin','super_admin']));

drop policy if exists "Admins can update change requests" on public.course_change_requests;
create policy "Admins can update change requests"
on public.course_change_requests
for update
using (public.has_roles(array['admin','super_admin']));

-- Coach-student mappings
drop policy if exists "Admins can manage coach-student mappings" on public.coach_student_mappings;
create policy "Admins can manage coach-student mappings"
on public.coach_student_mappings
for all
using (public.has_roles(array['admin','super_admin']));

drop policy if exists "Coaches can view their own student mappings" on public.coach_student_mappings;
create policy "Coaches can view their own student mappings"
on public.coach_student_mappings
for select
using (
  coach_user_id = (
    select user_id
      from public.user_profiles
     where email = coalesce(
       nullif(current_setting('app.impersonated_user_email', true), ''),
       nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
       nullif((auth.jwt() ->> 'impersonatedUser'), ''),
       auth.jwt() ->> 'email'
     )
     limit 1
  )
);

-- Coach notes
drop policy if exists "Users can view relevant notes" on public.coach_notes;
create policy "Users can view relevant notes"
on public.coach_notes
for select
using (
  (student_id = public.get_current_user_id())
  or
  (
    public.has_roles(array['coach']) and
    exists (
      select 1
        from public.coach_student_mappings csm
       where csm.coach_user_id = public.get_current_user_id()
         and csm.student_user_id = public.coach_notes.student_id
    )
  )
);

drop policy if exists "Users can create lesson notes or personal notes" on public.coach_notes;
create policy "Users can create lesson notes or personal notes"
on public.coach_notes
for insert
with check (
  author_id = public.get_current_user_id()
  and (
    student_id = public.get_current_user_id()
    or (
      (select 'coach' = any(roles) from public.user_profiles where user_id = public.get_current_user_id())
      and exists (
        select 1
          from public.coach_student_mappings
         where coach_user_id = public.get_current_user_id()
           and student_user_id = student_id
      )
    )
  )
);

drop policy if exists "Users can update their own notes" on public.coach_notes;
create policy "Users can update their own notes"
on public.coach_notes
for update
using (author_id = public.get_current_user_id());

drop policy if exists "Users can delete their own notes or replies" on public.coach_notes;
create policy "Users can delete their own notes or replies"
on public.coach_notes
for delete
using (author_id = public.get_current_user_id() or public.has_roles(array['coach']));

-- Rounds
drop policy if exists "Users can view their own rounds, super admins can view all" on public.rounds;
create policy "Users can view their own rounds, super admins can view all"
on public.rounds
for select
using (
  user_email = coalesce(
    nullif(current_setting('app.impersonated_user_email', true), ''),
    nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
    nullif((auth.jwt() ->> 'impersonatedUser'), ''),
    auth.jwt() ->> 'email'
  )
  or public.is_my_student(user_email)
  or public.has_roles(array['super_admin'])
);

drop policy if exists "Users can create their own rounds, super admins can create for others" on public.rounds;
create policy "Users can create their own rounds, super admins can create for others"
on public.rounds
for insert
with check (
  auth.role() = 'authenticated' and (
    user_email = coalesce(
      nullif(current_setting('app.impersonated_user_email', true), ''),
      nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
      nullif((auth.jwt() ->> 'impersonatedUser'), ''),
      auth.jwt() ->> 'email'
    )
    or public.has_roles(array['super_admin'])
  )
);

drop policy if exists "Users can update their own rounds, super admins can update all" on public.rounds;
create policy "Users can update their own rounds, super admins can update all"
on public.rounds
for update
using (
  user_email = coalesce(
    nullif(current_setting('app.impersonated_user_email', true), ''),
    nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
    nullif((auth.jwt() ->> 'impersonatedUser'), ''),
    auth.jwt() ->> 'email'
  )
  or public.has_roles(array['super_admin'])
);

drop policy if exists "Users can delete their own rounds, super admins can delete all" on public.rounds;
create policy "Users can delete their own rounds, super admins can delete all"
on public.rounds
for delete
using (
  user_email = coalesce(
    nullif(current_setting('app.impersonated_user_email', true), ''),
    nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
    nullif((auth.jwt() ->> 'impersonatedUser'), ''),
    auth.jwt() ->> 'email'
  )
  or public.has_roles(array['super_admin'])
);

-- Round holes
drop policy if exists "Users can view their own round holes" on public.round_holes;
create policy "Users can view their own round holes"
on public.round_holes
for select
using (
  exists (
    select 1
      from public.rounds
     where public.rounds.id = public.round_holes.round_id
       and (
         public.rounds.user_email = coalesce(
           nullif(current_setting('app.impersonated_user_email', true), ''),
           nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
           nullif((auth.jwt() ->> 'impersonatedUser'), ''),
           auth.jwt() ->> 'email'
         )
         or public.is_my_student(public.rounds.user_email)
         or public.has_roles(array['super_admin'])
       )
  )
);

drop policy if exists "Users can create their own round holes" on public.round_holes;
create policy "Users can create their own round holes"
on public.round_holes
for insert
with check (
  exists (
    select 1
      from public.rounds
     where public.rounds.id = public.round_holes.round_id
       and (
         public.rounds.user_email = coalesce(
           nullif(current_setting('app.impersonated_user_email', true), ''),
           nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
           nullif((auth.jwt() ->> 'impersonatedUser'), ''),
           auth.jwt() ->> 'email'
         )
         or public.has_roles(array['super_admin'])
       )
  )
);

drop policy if exists "Users can update their own round holes" on public.round_holes;
create policy "Users can update their own round holes"
on public.round_holes
for update
using (
  exists (
    select 1
      from public.rounds
     where public.rounds.id = public.round_holes.round_id
       and (
         public.rounds.user_email = coalesce(
           nullif(current_setting('app.impersonated_user_email', true), ''),
           nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
           nullif((auth.jwt() ->> 'impersonatedUser'), ''),
           auth.jwt() ->> 'email'
         )
         or public.has_roles(array['super_admin'])
       )
  )
);

drop policy if exists "Users can delete their own round holes" on public.round_holes;
create policy "Users can delete their own round holes"
on public.round_holes
for delete
using (
  exists (
    select 1
      from public.rounds
     where public.rounds.id = public.round_holes.round_id
       and (
         public.rounds.user_email = coalesce(
           nullif(current_setting('app.impersonated_user_email', true), ''),
           nullif((auth.jwt() -> 'user_metadata' ->> 'impersonatedUser'), ''),
           nullif((auth.jwt() ->> 'impersonatedUser'), ''),
           auth.jwt() ->> 'email'
         )
         or public.has_roles(array['super_admin'])
       )
  )
);

-- =========================================================
-- MY BAG RLS POLICIES (impersonation-safe now via get_current_user_id)
-- =========================================================

drop policy if exists "Allow users to manage their own shot types" on public.user_shot_types;
create policy "Allow users to manage their own shot types"
on public.user_shot_types
for all
using (user_id = public.get_current_user_id())
with check (user_id = public.get_current_user_id());

drop policy if exists "Allow users to manage their own clubs" on public.clubs;
create policy "Allow users to manage their own clubs"
on public.clubs
for all
using (user_id = public.get_current_user_id())
with check (user_id = public.get_current_user_id());

drop policy if exists "Allow users to manage shots for their own clubs" on public.shots;
create policy "Allow users to manage shots for their own clubs"
on public.shots
for all
using ((select user_id from public.clubs where id = club_id) = public.get_current_user_id())
with check ((select user_id from public.clubs where id = club_id) = public.get_current_user_id());

drop policy if exists "Allow users to manage their own bags" on public.bags;
create policy "Allow users to manage their own bags"
on public.bags
for all
using (user_id = public.get_current_user_id())
with check (user_id = public.get_current_user_id());

drop policy if exists "Allow users to manage their own bag_clubs links" on public.bag_clubs;
create policy "Allow users to manage their own bag_clubs links"
on public.bag_clubs
for all
using (
  (select user_id from public.bags where id = bag_id) = public.get_current_user_id()
  and
  (select user_id from public.clubs where id = club_id) = public.get_current_user_id()
)
with check (
  (select user_id from public.bags where id = bag_id) = public.get_current_user_id()
  and
  (select user_id from public.clubs where id = club_id) = public.get_current_user_id()
);
