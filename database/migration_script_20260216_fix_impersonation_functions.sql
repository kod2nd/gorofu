-- Fix impersonation-aware helper functions to support BOTH:
-- 1) session-local GUC: app.impersonated_user_email
-- 2) JWT user_metadata: impersonatedUser (email)

-- 0) Safety: ensure internal schema + unrestricted view exist (no-op if already)
create schema if not exists internal;

create or replace view internal.user_profiles_unrestricted as
select * from public.user_profiles;

grant select on internal.user_profiles_unrestricted to postgres;

-- 1) Update has_roles()
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

-- 2) Update get_my_roles()
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

-- 3) Update get_current_user_id()
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

-- 4) Update is_coach_viewing_authorized()
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

-- 5) Update is_my_student(student_email_to_check)
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

  -- Only check if current user is a coach
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
