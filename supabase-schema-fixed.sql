-- WalletWatch Database Schema
-- Run this in Supabase SQL Editor

-- Create users table (our custom user table)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    month TEXT NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monthly_notes table
CREATE TABLE IF NOT EXISTS public.monthly_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: YYYY-MM
    note_content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month)
);

-- Enable RLS on all our tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (in case you're re-running this)
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can read all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can read all notes" ON public.monthly_notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.monthly_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.monthly_notes;

-- Create RLS policies for users table
CREATE POLICY "Users can read their own data" ON public.users
    FOR SELECT USING (true); -- Allow reading for authentication

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (true);

-- Create RLS policies for expenses table
CREATE POLICY "Users can read all expenses" ON public.expenses
    FOR SELECT USING (true); -- Both users need to see all expenses for sharing

CREATE POLICY "Users can insert their own expenses" ON public.expenses
    FOR INSERT WITH CHECK (true); -- Will be handled by application logic

CREATE POLICY "Users can update their own expenses" ON public.expenses
    FOR UPDATE USING (true); -- Will be handled by application logic

CREATE POLICY "Users can delete their own expenses" ON public.expenses
    FOR DELETE USING (true); -- Will be handled by application logic

-- Create RLS policies for monthly_notes table
CREATE POLICY "Users can read all notes" ON public.monthly_notes
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own notes" ON public.monthly_notes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notes" ON public.monthly_notes
    FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON public.expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_monthly_notes_user_month ON public.monthly_notes(user_id, month);

-- Insert default users with placeholder password hashes
-- You'll need to update these with real hashed passwords
INSERT INTO public.users (username, email, password_hash) VALUES
('Soumyansh', 'soumyansh@walletwatch.local', '$2b$10$placeholder_hash_for_soumyansh'),
('Anu', 'anu@walletwatch.local', '$2b$10$placeholder_hash_for_anu')
ON CONFLICT (username) DO NOTHING;