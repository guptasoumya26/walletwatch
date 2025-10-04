-- Pending Balances Table Schema
-- Run this in Supabase SQL Editor

-- Create pending_balances table
CREATE TABLE IF NOT EXISTS public.pending_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creditor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    debtor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    settled_at TIMESTAMP WITH TIME ZONE NULL,
    settled_by UUID REFERENCES public.users(id),
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_balances_creditor ON public.pending_balances(creditor_id);
CREATE INDEX IF NOT EXISTS idx_pending_balances_debtor ON public.pending_balances(debtor_id);
CREATE INDEX IF NOT EXISTS idx_pending_balances_settled ON public.pending_balances(settled_at);
CREATE INDEX IF NOT EXISTS idx_pending_balances_created_by ON public.pending_balances(created_by);

-- Enable RLS
ALTER TABLE public.pending_balances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all pending balances" ON public.pending_balances;
DROP POLICY IF EXISTS "Users can insert pending balances" ON public.pending_balances;
DROP POLICY IF EXISTS "Users can update pending balances" ON public.pending_balances;
DROP POLICY IF EXISTS "Users can delete their own pending balances" ON public.pending_balances;

-- Create RLS policies
CREATE POLICY "Users can read all pending balances" ON public.pending_balances
    FOR SELECT USING (true);

CREATE POLICY "Users can insert pending balances" ON public.pending_balances
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update pending balances" ON public.pending_balances
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own pending balances" ON public.pending_balances
    FOR DELETE USING (true);

-- Add helpful comments
COMMENT ON TABLE public.pending_balances IS 'Stores non-shared expenses where one user owes another, tracked until settlement';
COMMENT ON COLUMN public.pending_balances.creditor_id IS 'User who will receive the money';
COMMENT ON COLUMN public.pending_balances.debtor_id IS 'User who owes the money';
COMMENT ON COLUMN public.pending_balances.settled_at IS 'NULL means pending, timestamp means settled';
COMMENT ON COLUMN public.pending_balances.settled_by IS 'User who marked this balance as settled';
COMMENT ON COLUMN public.pending_balances.created_by IS 'User who created this pending balance entry';
