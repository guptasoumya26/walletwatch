# WalletWatch - Localhost Setup Guide

## Quick Start for Local Development

### Step 1: Set up Supabase (Free Tier)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (choose any name, like "walletwatch-dev")
3. Wait for the project to be ready (2-3 minutes)

### Step 2: Get Your Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (starts with `https://xxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)
   - **service_role key** (also starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` but longer)

### Step 3: Configure Environment Variables

1. In your `walletwatch` folder, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace with your actual Supabase values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

### Step 4: Set up the Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click **Run** to execute the SQL

### Step 5: Create User Passwords

1. Create a temporary file `generate-passwords.js` in your project root:
   ```javascript
   const bcrypt = require('bcryptjs');

   async function generatePasswords() {
     // Replace these with your desired passwords
     const soumyanshPassword = await bcrypt.hash('soumyansh123', 10);
     const anuPassword = await bcrypt.hash('anu123', 10);

     console.log('Soumyansh password hash:');
     console.log(soumyanshPassword);
     console.log('\nAnu password hash:');
     console.log(anuPassword);
   }

   generatePasswords();
   ```

2. Run it to generate password hashes:
   ```bash
   node generate-passwords.js
   ```

3. Copy the generated hashes and update your database in Supabase SQL Editor:
   ```sql
   -- Replace the placeholder hashes with your generated ones
   UPDATE public.users
   SET password_hash = 'your_generated_hash_for_soumyansh'
   WHERE username = 'Soumyansh';

   UPDATE public.users
   SET password_hash = 'your_generated_hash_for_anu'
   WHERE username = 'Anu';
   ```

### Step 6: Start the Development Server

```bash
cd walletwatch
npm run dev
```

### Step 7: Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Login with:
   - **Username**: Soumyansh, **Password**: soumyansh123
   - **Username**: Anu, **Password**: anu123

## Demo Data (Optional)

To add some test expenses, you can run this SQL in Supabase:

```sql
-- Get user IDs first
SELECT id, username FROM public.users;

-- Add some sample expenses (replace user_id values with actual IDs from above)
INSERT INTO public.expenses (user_id, amount, category, description, expense_date, month) VALUES
('user-id-for-soumyansh', 2500.00, 'Rent', 'Monthly house rent', '2025-01-15', '2025-01'),
('user-id-for-soumyansh', 800.50, 'Blinkit', 'Groceries for the week', '2025-01-20', '2025-01'),
('user-id-for-anu', 1200.00, 'Zomato', 'Dinner orders', '2025-01-18', '2025-01'),
('user-id-for-anu', 450.00, 'Netflix', 'Monthly subscription', '2025-01-01', '2025-01');
```

## Troubleshooting

**Login not working?**
- Check if your password hashes are correctly updated in the database
- Verify environment variables in `.env.local`

**API errors?**
- Make sure your Supabase URL and keys are correct
- Check if the database schema was created properly

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and restart: `rm -rf .next && npm run dev`

## Default Test Credentials

If you used the example passwords above:
- **Soumyansh**: `soumyansh123`
- **Anu**: `anu123`

Remember to change these to secure passwords before deploying to production!