-- Pending Balances Archive Table Schema
-- This table stores cleared settlement history for admin review only
-- Run this in Supabase SQL Editor

-- Create archive table
CREATE TABLE IF NOT EXISTS public.pending_balances_archive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Original pending balance data
    original_balance_id UUID NOT NULL,
    creditor_id UUID NOT NULL,
    debtor_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    settled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    settled_by UUID,
    created_by UUID NOT NULL,
    -- Archive metadata
    cleared_by UUID NOT NULL REFERENCES public.users(id),
    cleared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    batch_id UUID NOT NULL DEFAULT gen_random_uuid()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_archive_original_balance ON public.pending_balances_archive(original_balance_id);
CREATE INDEX IF NOT EXISTS idx_archive_creditor ON public.pending_balances_archive(creditor_id);
CREATE INDEX IF NOT EXISTS idx_archive_debtor ON public.pending_balances_archive(debtor_id);
CREATE INDEX IF NOT EXISTS idx_archive_cleared_by ON public.pending_balances_archive(cleared_by);
CREATE INDEX IF NOT EXISTS idx_archive_batch ON public.pending_balances_archive(batch_id);

-- Enable RLS (admin only access via service role)
ALTER TABLE public.pending_balances_archive ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Only service role can access archive" ON public.pending_balances_archive;

-- Create RLS policy - NO ONE can access via client (admin/service role only)
CREATE POLICY "Only service role can access archive" ON public.pending_balances_archive
    FOR ALL USING (false);

-- Add cleared_for field to pending_balances table
-- This tracks which users have cleared this from their view
ALTER TABLE public.pending_balances
ADD COLUMN IF NOT EXISTS cleared_for UUID[];

-- Add index for cleared_for
CREATE INDEX IF NOT EXISTS idx_pending_balances_cleared_for ON public.pending_balances USING GIN(cleared_for);

-- Add helpful comments
COMMENT ON TABLE public.pending_balances_archive IS 'Archive of cleared settlement history - admin access only via Supabase dashboard';
COMMENT ON COLUMN public.pending_balances_archive.original_balance_id IS 'ID from the original pending_balances record';
COMMENT ON COLUMN public.pending_balances_archive.cleared_by IS 'User who cleared this item from their view';
COMMENT ON COLUMN public.pending_balances_archive.cleared_at IS 'When this item was cleared';
COMMENT ON COLUMN public.pending_balances_archive.batch_id IS 'Groups all items cleared together in one operation';
COMMENT ON COLUMN public.pending_balances.cleared_for IS 'Array of user IDs who have cleared this from their settled history view';
