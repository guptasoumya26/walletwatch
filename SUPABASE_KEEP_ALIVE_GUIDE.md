# Supabase Keep-Alive Setup Guide for Next.js Projects

This guide explains how to prevent Supabase free tier automatic pausing by implementing automated database activity monitoring.

## 📋 Table of Contents

- [Problem Overview](#problem-overview)
- [Solution Architecture](#solution-architecture)
- [Prerequisites](#prerequisites)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Verification Steps](#verification-steps)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## Problem Overview

### What Happens
Supabase free tier automatically pauses projects that have:
- No database activity for 7+ consecutive days
- Insufficient meaningful database operations

### Warning Email
You'll receive an email like:
```
Your project [PROJECT_NAME] was one of those and it is scheduled to be paused in a couple of days.
```

### Why Simple Solutions Don't Work
- ❌ HEAD requests (count-only queries) may not count as "sufficient activity"
- ❌ Vercel Hobby plan only allows daily cron jobs (not frequent enough for reliability)
- ❌ Using anon key can fail if RLS policies block queries
- ❌ Manual deploys don't create automatic webhooks properly

---

## Solution Architecture

### Multi-Layer Approach

```
┌─────────────────────────────────────────────────────────┐
│           GitHub Actions (Primary)                      │
│           Runs every 4 hours (FREE)                     │
│           ├─ Pings health endpoint                      │
│           └─ Independent of Vercel                      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│           Health Check Endpoint                         │
│           /api/health route                             │
│           ├─ Uses service role key (bypasses RLS)       │
│           ├─ SELECT query (read activity)               │
│           ├─ INSERT to health_checks (write activity)   │
│           └─ DELETE old records (maintenance)           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│           Vercel Cron (Backup)                          │
│           Runs daily at midnight (Hobby compatible)     │
│           └─ Provides redundancy                        │
└─────────────────────────────────────────────────────────┘
```

### Why This Works
- ✅ Real SELECT queries (read activity)
- ✅ Real INSERT operations (write activity)
- ✅ Service role key (no RLS issues)
- ✅ Runs 6x/day (every 4 hours via GitHub Actions)
- ✅ FREE for all components
- ✅ Automatic and reliable

---

## Prerequisites

### Required Information
Gather these from your Supabase project:

1. **Supabase Project URL**
   - Location: Supabase Dashboard → Settings → API
   - Format: `https://[project-ref].supabase.co`

2. **Supabase Anon Key**
   - Location: Supabase Dashboard → Settings → API → Project API keys → anon/public
   - Starts with: `eyJ...`

3. **Supabase Service Role Key** ⚠️ CRITICAL
   - Location: Supabase Dashboard → Settings → API → Project API keys → service_role
   - Starts with: `eyJ...`
   - ⚠️ **Keep this secret!** Never commit to git or expose publicly

4. **Existing Database Table**
   - You need at least one table (e.g., `users`, `posts`, etc.)
   - We'll query this to generate activity

---

## Step-by-Step Implementation

### Phase 1: Database Setup (Supabase)

#### Step 1.1: Create Health Checks Table

1. Open **Supabase Dashboard** → Your Project → **SQL Editor**

2. Copy and run this SQL:

```sql
-- Create health_checks table for monitoring database activity
CREATE TABLE IF NOT EXISTS public.health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  message TEXT,
  response_time_ms INTEGER
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_health_checks_checked_at
  ON public.health_checks(checked_at DESC);

-- Enable Row Level Security
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to insert
CREATE POLICY "Allow service role to insert health checks"
  ON public.health_checks
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policy to allow service role to select
CREATE POLICY "Allow service role to select health checks"
  ON public.health_checks
  FOR SELECT
  TO service_role
  USING (true);

-- Create policy to allow service role to delete (for cleanup)
CREATE POLICY "Allow service role to delete health checks"
  ON public.health_checks
  FOR DELETE
  TO service_role
  USING (true);

-- Add comment to table
COMMENT ON TABLE public.health_checks IS
  'Stores health check pings to keep database active and prevent Supabase free tier pausing';
```

3. Click **Run** (or F5)

4. Verify: You should see "Success. No rows returned"

---

### Phase 2: Next.js Application Setup

#### Step 2.1: Create Supabase Server Client (If Not Exists)

**File:** `src/lib/supabase-server.ts` (or `lib/supabase-server.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side only client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

**⚠️ Important:** This file should ONLY be imported in API routes, never in client components.

---

#### Step 2.2: Create Health Check API Route

**File:** `src/app/api/health/route.ts` (App Router) or `pages/api/health.ts` (Pages Router)

**For App Router (Next.js 13+):**

```typescript
import { supabaseAdmin } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const startTime = Date.now()

  try {
    console.log('[Health Check] Starting health check at', new Date().toISOString())

    // Perform actual SELECT query to generate real database activity
    // IMPORTANT: Replace 'users' with an actual table name from your database
    const { data: records, error: selectError } = await supabaseAdmin
      .from('users') // ← CHANGE THIS to your table name
      .select('id')
      .limit(1)

    if (selectError) {
      console.error('[Health Check] SELECT query failed:', selectError)
      throw selectError
    }

    console.log('[Health Check] SELECT query successful, found', records?.length || 0, 'records')

    // Perform INSERT to health_checks table to ensure write activity
    const responseTimeMs = Date.now() - startTime
    const { error: insertError } = await supabaseAdmin
      .from('health_checks')
      .insert({
        status: 'ok',
        message: 'Database active - read and write operations successful',
        response_time_ms: responseTimeMs,
        checked_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('[Health Check] INSERT to health_checks failed:', insertError)
      // Don't fail the health check if insert fails (table might not exist yet)
    } else {
      console.log('[Health Check] INSERT to health_checks successful')
    }

    // Cleanup old health check records (keep last 7 days)
    const { error: deleteError } = await supabaseAdmin
      .from('health_checks')
      .delete()
      .lt('checked_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (deleteError) {
      console.warn('[Health Check] Cleanup of old records failed:', deleteError)
    }

    const totalResponseTime = Date.now() - startTime

    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      operations: {
        select: 'success',
        insert: insertError ? 'failed' : 'success',
        cleanup: deleteError ? 'failed' : 'success'
      },
      response_time_ms: totalResponseTime,
      message: 'Health check completed successfully'
    }

    console.log('[Health Check] Completed successfully in', totalResponseTime, 'ms')

    return NextResponse.json(response)
  } catch (error) {
    const responseTimeMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('[Health Check] Exception:', errorMessage)

    // Try to log the failure to database
    try {
      await supabaseAdmin
        .from('health_checks')
        .insert({
          status: 'error',
          message: errorMessage,
          response_time_ms: responseTimeMs,
          checked_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error('[Health Check] Failed to log error to database:', logError)
    }

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: errorMessage,
      response_time_ms: responseTimeMs
    }, { status: 500 })
  }
}
```

**For Pages Router (Next.js 12 and earlier):**

```typescript
import { supabaseAdmin } from '@/lib/supabase-server'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startTime = Date.now()

  try {
    console.log('[Health Check] Starting health check at', new Date().toISOString())

    // Perform SELECT query
    const { data: records, error: selectError } = await supabaseAdmin
      .from('users') // ← CHANGE THIS to your table name
      .select('id')
      .limit(1)

    if (selectError) {
      console.error('[Health Check] SELECT query failed:', selectError)
      throw selectError
    }

    console.log('[Health Check] SELECT query successful')

    // Perform INSERT
    const responseTimeMs = Date.now() - startTime
    const { error: insertError } = await supabaseAdmin
      .from('health_checks')
      .insert({
        status: 'ok',
        message: 'Database active - read and write operations successful',
        response_time_ms: responseTimeMs,
        checked_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('[Health Check] INSERT failed:', insertError)
    } else {
      console.log('[Health Check] INSERT successful')
    }

    // Cleanup old records
    await supabaseAdmin
      .from('health_checks')
      .delete()
      .lt('checked_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const totalResponseTime = Date.now() - startTime

    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      operations: {
        select: 'success',
        insert: insertError ? 'failed' : 'success',
        cleanup: 'success'
      },
      response_time_ms: totalResponseTime,
      message: 'Health check completed successfully'
    })
  } catch (error) {
    const responseTimeMs = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('[Health Check] Exception:', errorMessage)

    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: errorMessage,
      response_time_ms: responseTimeMs
    })
  }
}
```

**⚠️ IMPORTANT:** Change `'users'` to an actual table name in your database!

---

#### Step 2.3: Configure Vercel Cron (Backup)

**File:** `vercel.json` (create in project root if it doesn't exist)

```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Note:**
- `0 0 * * *` = Daily at midnight UTC
- Vercel Hobby plan only allows daily crons
- This serves as a backup to GitHub Actions

---

#### Step 2.4: Update Environment Variables

**File:** `.env.local` (local development)

```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ[your-anon-key]...
SUPABASE_SERVICE_ROLE_KEY=eyJ[your-service-role-key]...
```

**⚠️ Security:**
- ✅ Add to `.gitignore`
- ✅ Never commit to git
- ✅ Keep service role key secret

---

### Phase 3: GitHub Actions Setup

#### Step 3.1: Create GitHub Actions Workflow

**File:** `.github/workflows/keep-alive.yml`

```yaml
name: Keep Supabase Active

on:
  schedule:
    # Run every 4 hours
    - cron: '0 */4 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  ping-health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Ping health check endpoint
        run: |
          echo "Pinging health check endpoint..."
          response=$(curl -s -o /dev/null -w "%{http_code}" https://YOUR-APP.vercel.app/api/health)
          echo "Response code: $response"

          if [ $response -eq 200 ]; then
            echo "✅ Health check successful"
          else
            echo "❌ Health check failed with code $response"
            exit 1
          fi

      - name: Log timestamp
        run: echo "Health check completed at $(date)"
```

**⚠️ IMPORTANT:** Replace `YOUR-APP.vercel.app` with your actual Vercel deployment URL!

---

#### Step 3.2: Enable GitHub Actions

1. Commit and push the workflow file:
   ```bash
   git add .github/workflows/keep-alive.yml
   git commit -m "feat: add GitHub Actions workflow to keep Supabase active"
   git push
   ```

2. Go to your GitHub repository → **Settings** → **Actions** → **General**

3. Under "Actions permissions":
   - Select: ✅ **"Allow all actions and reusable workflows"**
   - Click **"Save"**

---

### Phase 4: Vercel Deployment

#### Step 4.1: Set Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add these three variables for **all environments** (Production, Preview, Development):

   | Name | Value | Source |
   |------|-------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://[ref].supabase.co` | Supabase Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase Settings → API → anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase Settings → API → service_role |

3. Click **"Save"** for each

---

#### Step 4.2: Deploy to Vercel

**Option A: Git Auto-Deploy (Recommended)**

1. Connect your GitHub repository to Vercel:
   - Vercel Dashboard → **Add New** → **Project**
   - **Import** your GitHub repository
   - Configure settings (framework should auto-detect)
   - Add environment variables
   - Click **"Deploy"**

2. Verify Git connection:
   - Settings → **Git** → Should show repository connected
   - **Production Branch**: Should be `main` or `master`

**Option B: CLI Deploy**

```bash
npm install -g vercel
vercel --prod
```

**⚠️ Common Issues:**

- **"Vulnerable version of Next.js detected"** → Update Next.js:
  ```bash
  npm update next
  git add package.json package-lock.json
  git commit -m "fix: update Next.js to latest version"
  git push
  ```

- **Build fails** → Check Vercel logs for specific errors

- **Old commit deploying** → Delete project and reimport fresh

---

#### Step 4.3: Update GitHub Actions with Vercel URL

After deployment, get your Vercel URL (e.g., `my-app-abc123.vercel.app`)

**Update:** `.github/workflows/keep-alive.yml`

Replace:
```yaml
response=$(curl -s -o /dev/null -w "%{http_code}" https://YOUR-APP.vercel.app/api/health)
```

With your actual URL:
```yaml
response=$(curl -s -o /dev/null -w "%{http_code}" https://my-app-abc123.vercel.app/api/health)
```

Commit and push:
```bash
git add .github/workflows/keep-alive.yml
git commit -m "fix: update GitHub Actions with Vercel deployment URL"
git push
```

---

## Verification Steps

### ✅ Step 1: Test Health Check Endpoint

**Via Browser:**
```
https://your-app.vercel.app/api/health
```

**Expected Response:**
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

**Via Terminal:**
```bash
curl https://your-app.vercel.app/api/health
```

---

### ✅ Step 2: Verify GitHub Actions

1. Go to: `https://github.com/[username]/[repo]/actions`

2. Click on **"Keep Supabase Active"** workflow (left sidebar)

3. Click **"Run workflow"** → Select `main` branch → **"Run workflow"**

4. Wait 10-20 seconds, refresh page

5. **Expected:** Green checkmark ✅ with success message

6. Click on the workflow run to see logs:
   - Should show "Health check successful"
   - Should show 200 response code

---

### ✅ Step 3: Check Vercel Cron Configuration

1. Vercel Dashboard → Your Project → **Settings** → **Cron Jobs**

2. **Should see:**
   - Path: `/api/health`
   - Schedule: `0 0 * * *`
   - Status: Enabled/Active

---

### ✅ Step 4: Verify Database Logs

**In Supabase SQL Editor:**

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

**Expected Results:**
- At least 1-2 entries from manual testing
- New entries appear every 4 hours (GitHub Actions)
- All should show `status = 'ok'`

---

### ✅ Step 5: Monitor Vercel Logs

1. Vercel Dashboard → Your Project → **Deployments**

2. Click on latest deployment → **Functions** tab

3. Click on `/api/health` function

4. **Look for:**
   - `[Health Check]` log entries
   - "Health check completed successfully"
   - No errors

---

## Troubleshooting

### Issue: "Deployment not found" or 404 on Health Check

**Cause:** Endpoint not deployed or wrong URL

**Fix:**
1. Verify deployment completed successfully in Vercel
2. Check exact URL: `https://[your-domain].vercel.app/api/health`
3. For App Router: Ensure file is at `src/app/api/health/route.ts`
4. For Pages Router: Ensure file is at `pages/api/health.ts`

---

### Issue: GitHub Actions Shows "Health check failed with code 500"

**Cause:** Health endpoint returning error

**Fix:**
1. Test endpoint manually in browser
2. Check Vercel logs for error details
3. Common causes:
   - Missing `SUPABASE_SERVICE_ROLE_KEY` env var
   - Wrong table name in SELECT query
   - RLS policies blocking service role (shouldn't happen)

---

### Issue: "Cannot find module '@/lib/supabase-server'"

**Cause:** Path alias not configured or file doesn't exist

**Fix:**
1. Check `tsconfig.json` has path alias:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```
2. Ensure file exists at `src/lib/supabase-server.ts`
3. Or adjust import path: `import { supabaseAdmin } from '../../../lib/supabase-server'`

---

### Issue: Vercel Deployment Shows Old Code

**Cause:** Git webhook not working or cached deployment

**Fix:**
1. **Disconnect and reconnect Git:**
   - Settings → Git → Disconnect
   - Settings → Git → Connect Git Repository
   - Select your repo

2. **Force fresh deployment:**
   - Deployments → Latest → ⋯ menu → Redeploy
   - **UNCHECK** "Use existing Build Cache"
   - Click Redeploy

3. **Nuclear option:**
   - Delete Vercel project entirely
   - Reimport from GitHub fresh
   - Re-add environment variables

---

### Issue: "Vulnerable version of Next.js detected" Error

**Cause:** Security vulnerability in Next.js version

**Fix:**
```bash
npm update next
git add package.json package-lock.json
git commit -m "fix: update Next.js to patch CVE vulnerability"
git push
```

Wait for Vercel to auto-deploy or manually redeploy.

---

### Issue: GitHub Actions Workflow Not Visible

**Cause:** Actions might be disabled for repository

**Fix:**
1. GitHub repo → **Settings** → **Actions** → **General**
2. Under "Actions permissions":
   - Select: ✅ **"Allow all actions and reusable workflows"**
3. Click **"Save"**
4. Go to **Actions** tab (top navigation)
5. Workflow should now appear

---

### Issue: No Entries in health_checks Table

**Cause:** INSERT operation failing or table doesn't exist

**Fix:**
1. Verify table exists:
   ```sql
   SELECT * FROM health_checks LIMIT 1;
   ```
2. If table doesn't exist, run the CREATE TABLE SQL from Phase 1
3. Check Vercel logs for INSERT errors
4. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly

---

### Issue: Vercel Hobby Plan Cron Error

**Error Message:**
```
Hobby accounts are limited to daily cron jobs. This cron expression (0 */4 * * *)
would run more than once per day.
```

**Fix:**
- Vercel Hobby plan only allows daily crons
- Keep `vercel.json` as `0 0 * * *` (daily)
- Rely on GitHub Actions for 4-hour frequency
- GitHub Actions is FREE and has no such limitation

---

### Issue: Still Receiving Inactivity Emails After Setup

**Cause:** Setup was recent, Supabase needs 7+ days to see activity pattern

**What to do:**
1. Wait 7-10 days for automated health checks to establish pattern
2. Verify health checks are actually running:
   - Check GitHub Actions runs
   - Check health_checks table has new entries
   - Check Vercel logs
3. Manually unpause project if it gets paused:
   - Supabase Dashboard → Project Settings → Unpause
4. If emails continue after 10+ days with proven health checks:
   - Consider upgrading to Supabase Pro ($25/month)
   - Or contact Supabase support with evidence of activity

---

## Maintenance

### Weekly Monitoring (Recommended)

**Check GitHub Actions:**
1. Go to: `https://github.com/[user]/[repo]/actions`
2. Verify workflow runs show green checkmarks ✅
3. If failures: Click on failed run to see error logs

**Check Database:**
```sql
-- Should have ~42 entries per week (6 per day × 7 days)
SELECT COUNT(*) as total_checks,
       MIN(checked_at) as oldest,
       MAX(checked_at) as newest
FROM health_checks
WHERE checked_at > NOW() - INTERVAL '7 days';
```

**Expected:**
- `total_checks`: 40-45 entries
- `newest`: Within last 4 hours

---

### Monthly Cleanup (Optional)

The health check automatically cleans up records older than 7 days, but you can manually verify:

```sql
-- Check table size
SELECT COUNT(*) FROM health_checks;

-- Should be ~42-50 entries (7 days × 6 per day + some buffer)

-- Manual cleanup if needed
DELETE FROM health_checks
WHERE checked_at < NOW() - INTERVAL '7 days';
```

---

### If You Change Vercel URL

**Example:** Rename project or change domain

**Update GitHub Actions:**
1. Edit `.github/workflows/keep-alive.yml`
2. Change URL to new deployment URL
3. Commit and push

---

## Cost Summary

| Component | Cost | Notes |
|-----------|------|-------|
| Supabase Free Tier | $0 | 500MB database, pauses after 7 days inactivity |
| Vercel Hobby Plan | $0 | Limited to daily crons |
| GitHub Actions | $0 | 2,000 minutes/month free (we use ~30 min/month) |
| **Total Monthly Cost** | **$0** | ✅ Completely free! |

---

## Alternative Solutions

If this solution doesn't work for you:

### Option 1: External Monitoring Service

**UptimeRobot** (Free):
- Create monitor for your health endpoint
- Ping every 5 minutes
- Email alerts on downtime
- URL: https://uptimerobot.com

### Option 2: Upgrade Supabase

**Supabase Pro** ($25/month):
- No automatic pausing
- Better performance
- More storage
- Priority support

### Option 3: Self-Hosted Cron

**Use any server you have:**
```bash
# Add to crontab
0 */4 * * * curl -s https://your-app.vercel.app/api/health > /dev/null
```

---

## Security Considerations

### ⚠️ Critical: Service Role Key

**DO:**
- ✅ Store in environment variables only
- ✅ Add to `.gitignore`
- ✅ Use only in API routes (server-side)
- ✅ Rotate if exposed

**DON'T:**
- ❌ Commit to git
- ❌ Expose in client-side code
- ❌ Share publicly
- ❌ Log in console output

### Health Endpoint Security

The `/api/health` endpoint is publicly accessible. This is intentional for external monitoring.

**To add authentication (optional):**

```typescript
// In your health check route
export async function GET(request: Request) {
  // Add secret token check
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.HEALTH_CHECK_SECRET

  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... rest of health check code
}
```

Then update GitHub Actions and Vercel to use the token.

---

## FAQ

**Q: How often does the health check run?**
A: Every 4 hours via GitHub Actions + daily via Vercel cron = 6-7 times per day.

**Q: Will this cost money?**
A: No, all components are free within their limits.

**Q: What if GitHub Actions fails?**
A: The Vercel daily cron acts as backup. Plus, missing one check won't cause immediate pausing.

**Q: Can I use this with Supabase Pro?**
A: Yes, but Supabase Pro doesn't auto-pause, so it's not necessary.

**Q: Does this work with other databases?**
A: The concept works, but you'll need to adapt the SQL and connection code.

**Q: Can I change the frequency?**
A: Yes! Edit the GitHub Actions cron schedule. Common options:
- `0 */2 * * *` = Every 2 hours
- `0 */6 * * *` = Every 6 hours
- `*/30 * * * *` = Every 30 minutes (might be excessive)

**Q: What if I'm using Vercel Pro?**
A: You can use more frequent Vercel crons if desired, but GitHub Actions works great either way.

---

## Summary Checklist

Use this checklist when setting up a new project:

### Phase 1: Supabase
- [ ] Run CREATE TABLE SQL for health_checks
- [ ] Verify table exists in Supabase dashboard
- [ ] Copy service role key

### Phase 2: Next.js Code
- [ ] Create `supabase-server.ts` with service role client
- [ ] Create health check API route (`/api/health`)
- [ ] Update table name in SELECT query
- [ ] Create `vercel.json` with daily cron
- [ ] Test locally: `npm run dev` → visit `/api/health`

### Phase 3: GitHub Actions
- [ ] Create `.github/workflows/keep-alive.yml`
- [ ] Enable GitHub Actions in repo settings
- [ ] Commit and push workflow file

### Phase 4: Deployment
- [ ] Set all 3 environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Update GitHub Actions with deployment URL
- [ ] Commit and push updated workflow

### Phase 5: Verification
- [ ] Test health endpoint in browser
- [ ] Manually run GitHub Actions workflow
- [ ] Check Vercel cron configuration
- [ ] Query health_checks table in Supabase
- [ ] Check Vercel function logs

### Phase 6: Monitoring
- [ ] Set calendar reminder to check weekly
- [ ] Bookmark GitHub Actions page
- [ ] Save Supabase SQL query for checking logs

---

## Need Help?

If you run into issues:

1. **Check Vercel Logs:**
   - Deployment logs for build errors
   - Function logs for runtime errors

2. **Check GitHub Actions Logs:**
   - Workflow run details show curl output

3. **Check Supabase Logs:**
   - API logs show database queries

4. **Test Manually:**
   ```bash
   curl -v https://your-app.vercel.app/api/health
   ```

5. **Review this guide's Troubleshooting section**

---

## Version History

- **v1.0** (2025-12-24): Initial comprehensive guide
  - Multi-layer approach with GitHub Actions + Vercel Cron
  - Service role key implementation
  - Full troubleshooting section

---

**End of Guide** 🎉

Your Supabase project will now stay active indefinitely with automated health checks running 6+ times per day!
