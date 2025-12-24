-- Create health_checks table for monitoring database activity
CREATE TABLE IF NOT EXISTS public.health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  message TEXT,
  response_time_ms INTEGER
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at ON public.health_checks(checked_at DESC);

-- Enable Row Level Security
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert (cron job will use service role key)
CREATE POLICY "Allow service role to insert health checks"
  ON public.health_checks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policy to allow service role to select health checks
CREATE POLICY "Allow service role to select health checks"
  ON public.health_checks
  FOR SELECT
  TO service_role
  USING (true);

-- Optional: Create a function to auto-cleanup old health check records (keep last 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_health_checks()
RETURNS void AS $$
BEGIN
  DELETE FROM public.health_checks
  WHERE checked_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to table
COMMENT ON TABLE public.health_checks IS 'Stores health check pings to keep database active and prevent Supabase free tier pausing';
