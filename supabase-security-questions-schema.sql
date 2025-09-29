-- Add security questions to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS security_question_1 TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS security_answer_1 TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS security_question_2 TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS security_answer_2 TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS security_question_3 TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS security_answer_3 TEXT;

-- Remove the password_resets table since we don't need it anymore
DROP TABLE IF EXISTS public.password_resets;