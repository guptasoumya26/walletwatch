# Health Check Setup Guide

This guide explains the improved health check system to prevent Supabase free tier automatic pausing.

## What Was Implemented

### 1. Database Table
Created `health_checks` table to store health check logs and ensure write activity.

### 2. Improved Health Check Endpoint
- **Location**: `src/app/api/health/route.ts`
- **Improvements**:
  - Uses service role key (bypasses RLS)
  - Performs actual SELECT query (not just HEAD request)
  - Writes to health_checks table (ensures write activity)
  - Auto-cleanup of old records (keeps last 7 days)
  - Comprehensive logging for monitoring
  - Response time tracking

### 3. Increased Cron Frequency
- **Previous**: Every 6 hours
- **Current**: Every 4 hours (6 times per day)
- **Configuration**: `vercel.json`

## Setup Steps

### Step 1: Run Database Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project: **Wallet-Watch** (ID: jwiofuebltvlaybrceam)
3. Go to **SQL Editor** in the left sidebar
4. Copy the contents of `supabase/migrations/create_health_checks_table.sql`
5. Paste into the SQL Editor and click **Run**

This will create:
- `health_checks` table with proper RLS policies
- Index for efficient queries
- Auto-cleanup function (optional)

### Step 2: Verify Environment Variables

Ensure these are set in your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is required for the health check to bypass RLS.

To find these values:
1. Supabase Dashboard → Settings → API
2. Copy the service role key (keep it secret!)

### Step 3: Deploy to Production

```bash
git add .
git commit -m "feat: improve health check with write operations and monitoring"
git push
```

**Important**: Vercel cron jobs only work on **production** deployments, not preview branches.

### Step 4: Verify Cron Job in Vercel

1. Go to Vercel dashboard: https://vercel.com
2. Select your **walletwatch** project
3. Go to **Settings** → **Cron Jobs**
4. Verify the health check cron is listed and enabled
5. Check the schedule shows: `0 */4 * * *` (every 4 hours)

### Step 5: Test the Health Check

After deployment, test the endpoint:

```bash
curl https://walletwatch-rose.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-24T...",
  "database": "connected",
  "operations": {
    "select": "success",
    "insert": "success",
    "cleanup": "success"
  },
  "response_time_ms": 123,
  "message": "Health check completed successfully"
}
```

### Step 6: Monitor Health Checks

#### View Logs in Vercel
1. Vercel Dashboard → Your Project → Logs
2. Look for `[Health Check]` entries
3. Verify cron is executing every 4 hours

#### View Health Check History in Supabase
Run this query in Supabase SQL Editor:

```sql
SELECT
  checked_at,
  status,
  message,
  response_time_ms
FROM health_checks
ORDER BY checked_at DESC
LIMIT 20;
```

## How It Works

### What Prevents Pausing?

Supabase pauses projects with insufficient activity. Our health check ensures continuous activity by:

1. **Read Activity**: SELECT query on users table every 4 hours
2. **Write Activity**: INSERT into health_checks table every 4 hours
3. **Maintenance Activity**: DELETE old records (cleanup)

This creates genuine database activity that Supabase recognizes as "sufficient activity."

### Monitoring

The health check logs all operations:
- Success/failure of each operation
- Response times
- Error messages
- Timestamps

Check Vercel logs for `[Health Check]` entries to monitor execution.

## Troubleshooting

### Health Check Returns 500 Error

**Cause**: Service role key not set or health_checks table doesn't exist

**Fix**:
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables
2. Run the migration SQL in Supabase dashboard
3. Redeploy the application

### Cron Not Running

**Cause**: Vercel cron requires production deployment

**Fix**:
1. Ensure code is deployed to production (not preview)
2. Check Vercel Settings → Cron Jobs
3. Verify your Vercel plan supports cron jobs

### Still Receiving Inactivity Warnings

**Timeline**: The health check needs to run for 7+ days to prevent pausing

**What to do**:
1. Unpause your project in Supabase dashboard immediately
2. Verify health check is running (check logs)
3. Monitor for the next few days
4. Consider upgrading to Supabase Pro if warnings continue

## Additional Recommendations

### Upgrade to Supabase Pro
If you want to eliminate pausing concerns entirely:
- No automatic pausing
- Better performance
- More resources
- Priority support

Cost: Check current pricing at https://supabase.com/pricing

### Monitor Regularly
Set up a reminder to check:
1. Vercel cron logs weekly
2. Health check history in Supabase
3. Any Supabase emails about inactivity

## Questions?

If you continue to receive inactivity warnings after 7 days:
1. Check Vercel logs for cron execution
2. Query health_checks table for recent entries
3. Verify service role key is correctly set
4. Consider upgrading to Supabase Pro
