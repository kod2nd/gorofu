INSERT INTO public.user_profiles (user_id, email, full_name, role, status)
SELECT
    u.id,
    u.email,
    u.raw_user_meta_data ->> 'full_name',
    'user', -- Default role for backfilled users
    'active'  -- Default status for backfilled users
FROM
    auth.users u
WHERE
    NOT EXISTS (
        SELECT 1
        FROM public.user_profiles p
        WHERE p.user_id = u.id
    );