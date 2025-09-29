# WalletWatch Deployment Guide

## Prerequisites

1. **Supabase Project Setup**
   - Create a new project at [supabase.com](https://supabase.com)
   - Note your project URL and anon key from the API settings
   - Get your service role key (keep this secret!)

2. **Vercel Account**
   - Create account at [vercel.com](https://vercel.com)
   - Connect your GitHub repository

## Step 1: Database Setup

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` and execute it
3. This will create the necessary tables and security policies

## Step 2: Create User Passwords

Generate hashed passwords for the users using Node.js:

```javascript
const bcrypt = require('bcryptjs');

async function generatePasswords() {
  const soumyanshPassword = await bcrypt.hash('your_chosen_password_for_soumyansh', 10);
  const anuPassword = await bcrypt.hash('your_chosen_password_for_anu', 10);

  console.log('Soumyansh password hash:', soumyanshPassword);
  console.log('Anu password hash:', anuPassword);
}

generatePasswords();
```

3. Update the SQL file with the real password hashes and re-run the user insertion:

```sql
-- Update the users with real password hashes
UPDATE public.users
SET password_hash = 'actual_bcrypt_hash_for_soumyansh'
WHERE username = 'Soumyansh';

UPDATE public.users
SET password_hash = 'actual_bcrypt_hash_for_anu'
WHERE username = 'Anu';
```

## Step 3: Environment Variables

Set up these environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Step 4: Deploy to Vercel

1. Push your code to GitHub
2. Connect the repository to Vercel
3. Set the environment variables in Vercel dashboard
4. Deploy the application

## Step 5: Test the Application

1. Visit your deployed application
2. Login with both users to test functionality
3. Add some test expenses
4. Verify all features work correctly

## Security Notes

- Never commit actual environment variables to the repository
- Keep the service role key secure
- Use strong passwords for the user accounts
- The application uses Row Level Security (RLS) for data protection

## Troubleshooting

- If login fails, check the password hashes in the database
- If API calls fail, verify environment variables are set correctly
- Check Supabase logs for database errors
- Verify all SQL policies are in place

## Post-Deployment

- Test all functionality thoroughly
- Set up monitoring if needed
- Consider setting up database backups
- Document any custom configuration for future reference