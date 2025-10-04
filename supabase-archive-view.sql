-- Create a readable view of pending_balances_archive for admin
-- This view joins with users table to show usernames instead of UUIDs
-- Run this in Supabase SQL Editor

CREATE OR REPLACE VIEW public.pending_balances_archive_readable AS
SELECT
    a.id,
    a.original_balance_id,
    -- User names instead of IDs
    creditor.username as creditor_name,
    debtor.username as debtor_name,
    creator.username as created_by_name,
    settler.username as settled_by_name,
    clearer.username as cleared_by_name,
    -- Financial details
    a.amount,
    a.description,
    a.category,
    -- Timestamps
    a.created_at,
    a.settled_at,
    a.cleared_at,
    -- Metadata
    a.batch_id,
    -- Keep IDs for reference (in case needed)
    a.creditor_id,
    a.debtor_id,
    a.created_by as created_by_id,
    a.settled_by as settled_by_id,
    a.cleared_by as cleared_by_id
FROM public.pending_balances_archive a
LEFT JOIN public.users creditor ON a.creditor_id = creditor.id
LEFT JOIN public.users debtor ON a.debtor_id = debtor.id
LEFT JOIN public.users creator ON a.created_by = creator.id
LEFT JOIN public.users settler ON a.settled_by = settler.id
LEFT JOIN public.users clearer ON a.cleared_by = clearer.id
ORDER BY a.cleared_at DESC;

-- Grant access to the view (service role only, matching archive table)
ALTER VIEW public.pending_balances_archive_readable OWNER TO postgres;

-- Add helpful comment
COMMENT ON VIEW public.pending_balances_archive_readable IS 'Human-readable view of pending_balances_archive with usernames instead of UUIDs. Admin access only via Supabase dashboard.';

-- Optional: Create a summary view showing clear statistics per user
CREATE OR REPLACE VIEW public.pending_balances_clear_summary AS
SELECT
    u.username as cleared_by,
    COUNT(*) as total_items_cleared,
    SUM(a.amount) as total_amount_cleared,
    MIN(a.cleared_at) as first_clear_date,
    MAX(a.cleared_at) as last_clear_date,
    COUNT(DISTINCT a.batch_id) as total_clear_operations
FROM public.pending_balances_archive a
LEFT JOIN public.users u ON a.cleared_by = u.id
GROUP BY u.username
ORDER BY total_items_cleared DESC;

COMMENT ON VIEW public.pending_balances_clear_summary IS 'Summary statistics of cleared settlement history per user. Admin access only.';
