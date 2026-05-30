
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
-- Re-add as deferrable so demo profiles without auth records are allowed; using simple drop only
-- (No FK now; the signup trigger still inserts the proper auth.users.id)
