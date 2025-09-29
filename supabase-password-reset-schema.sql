-- Add password reset table
CREATE TABLE IF NOT EXISTS public.password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reset_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on password_resets table
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for password_resets table
DROP POLICY IF EXISTS "Anyone can insert password reset requests" ON public.password_resets;
CREATE POLICY "Anyone can insert password reset requests" ON public.password_resets
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read valid reset tokens" ON public.password_resets;
CREATE POLICY "Anyone can read valid reset tokens" ON public.password_resets
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can update password reset tokens" ON public.password_resets;
CREATE POLICY "Anyone can update password reset tokens" ON public.password_resets
    FOR UPDATE USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON public.password_resets(reset_token);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires ON public.password_resets(expires_at);