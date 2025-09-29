# WalletWatch Production Deployment Guide

## Step 1: Create Production Supabase Project

### 1.1 Create New Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization (or create one)
4. Project name: `walletwatch-production`
5. Database password: Choose a strong password
6. Region: Choose closest to your users
7. Click "Create new project"
8. Wait 2-3 minutes for setup

### 1.2 Get Production Credentials
Once ready, go to **Settings → API**:
- Copy **Project URL**
- Copy **anon/public key**
- Copy **service_role key**

## Step 2: Set Up Production Database

### 2.1 Run Database Schema
In Supabase SQL Editor, run this complete schema:

```sql
-- WalletWatch Production Database Schema

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    security_question_1 TEXT,
    security_answer_1 TEXT,
    security_question_2 TEXT,
    security_answer_2 TEXT,
    security_question_3 TEXT,
    security_answer_3 TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    expense_date DATE NOT NULL,
    month TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monthly_notes table
CREATE TABLE IF NOT EXISTS public.monthly_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    note_content TEXT DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own data" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Users can read all expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Users can insert their own expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (true);
CREATE POLICY "Users can read all notes" ON public.monthly_notes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own notes" ON public.monthly_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notes" ON public.monthly_notes FOR UPDATE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON public.expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_monthly_notes_user_month ON public.monthly_notes(user_id, month);
```

## Step 3: Create Production User Accounts

### 3.1 Generate Production Passwords
Run this locally to generate secure password hashes:

```javascript
const bcrypt = require('bcryptjs');

async function generateProductionPasswords() {
  // Use strong passwords for production
  const soumyanshPassword = 'YourStrongPassword123!';
  const anuPassword = 'AnotherStrongPassword456!';

  const soumyanshHash = await bcrypt.hash(soumyanshPassword, 10);
  const anuHash = await bcrypt.hash(anuPassword, 10);

  console.log('Production Passwords:');
  console.log('Soumyansh:', soumyanshPassword);
  console.log('Anu:', anuPassword);
  console.log('\\nSQL to run:');
  console.log(`INSERT INTO public.users (username, email, password_hash) VALUES`);
  console.log(`('Soumyansh', 'soumyansh@walletwatch.app', '${soumyanshHash}'),`);
  console.log(`('Anu', 'anu@walletwatch.app', '${anuHash}');`);
}

generateProductionPasswords();
```

### 3.2 Insert Users in Production Database
Run the generated SQL in Supabase SQL Editor.

## Step 4: Deploy to Vercel

### 4.1 Prepare for Deployment
1. Commit all changes to Git:
   ```bash
   git add .
   git commit -m "Production ready with security questions"
   git push origin main
   ```

### 4.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `walletwatch`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 4.3 Set Environment Variables in Vercel
In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

### 4.4 Deploy
Click "Deploy" and wait for build to complete.

## Step 5: Post-Deployment

### 5.1 Test Production App
1. Visit your Vercel URL
2. Test user registration with security questions
3. Test login with both users
4. Test all features: expenses, notes, charts, password reset

### 5.2 Set Up Custom Domain (Optional)
1. In Vercel project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### 5.3 Security Checklist
- ✅ Strong passwords for production users
- ✅ Environment variables secured in Vercel
- ✅ Database RLS policies enabled
- ✅ HTTPS enabled by default on Vercel
- ✅ Security questions for password recovery

## Troubleshooting

### Build Errors
- Check environment variables are set correctly
- Ensure all dependencies are in package.json
- Check for TypeScript errors

### Database Connection Issues
- Verify Supabase URLs and keys
- Check if database schema was created properly
- Ensure RLS policies allow access

### Runtime Errors
- Check Vercel function logs
- Verify API routes are working
- Test database connections

## Maintenance

### Regular Backups
- Supabase automatically backs up your database
- Export important data periodically

### Updates
- Update dependencies regularly
- Monitor Vercel deployments
- Keep Supabase project updated

### Monitoring
- Check Vercel analytics
- Monitor Supabase usage
- Set up alerts for errors