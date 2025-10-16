# Authentication Setup Guide

This guide explains how to set up user authentication for your Sellr application.

## Overview

The authentication system provides:
- User registration and login
- Protected routes (dashboard, create listing)
- User-specific content and listings
- Secure API endpoints

## Features Implemented

### 🔐 Authentication Pages
- **Login** (`/auth/login`) - Sign in with email/password
- **Signup** (`/auth/signup`) - Create new account with email verification
- **Forgot Password** (`/auth/forgot-password`) - Password reset via email

### 🏠 User Experience
- **Home Page** - Different content for authenticated vs anonymous users
- **Dashboard** (`/dashboard`) - Protected route showing user's listings
- **Create Listing** (`/create`) - Protected route for creating new posts
- **Navbar** - Shows authentication state with sign in/out buttons

### 🛡️ Security
- Row Level Security (RLS) policies in Supabase
- Protected API endpoints requiring authentication
- User-specific data isolation

## Setup Instructions

### 1. Supabase Configuration

#### Enable Authentication
1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Settings**
3. Enable **Email** provider
4. Configure email templates (optional)

#### Set up Email Confirmation
1. In **Authentication > Settings**
2. Turn off **Enable email confirmations** for development (optional)
3. For production, configure SMTP settings

#### Get Service Role Key
1. Go to **Settings > API**
2. Copy the **service_role** key (keep this secret!)
3. Add it to your `.env.local` file

### 2. Environment Variables

Update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
SELLR_BASE_URL=http://localhost:3000
```

### 3. Database Schema

Run the updated SQL schema in your Supabase SQL editor:

```sql
-- The existing posts table with RLS policies
-- (already includes authentication-based policies)

-- Enable Row Level Security
alter table public.posts enable row level security;

-- RLS Policies
create policy "posts_select_policy" on public.posts
  for select using (is_active = true or owner = auth.uid());

create policy "posts_insert_policy" on public.posts
  for insert with check (owner = auth.uid());

create policy "posts_update_policy" on public.posts
  for update using (owner = auth.uid());

create policy "posts_delete_policy" on public.posts
  for delete using (owner = auth.uid());
```

### 4. Test the Authentication Flow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test user registration:**
   - Go to `/auth/signup`
   - Create a new account
   - Check your email for confirmation (if enabled)

3. **Test user login:**
   - Go to `/auth/login`
   - Sign in with your credentials

4. **Test protected routes:**
   - Try accessing `/dashboard` and `/create` when logged out
   - Should redirect to login page

5. **Test user-specific content:**
   - Create a listing when logged in
   - Check that it appears in your dashboard
   - Verify other users can't see it in their dashboard

## File Structure

```
app/
├── auth/
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   └── forgot-password/page.tsx # Password reset
├── dashboard/page.tsx          # Protected dashboard
├── create/page.tsx            # Protected create listing
└── page.tsx                   # Home page (auth-aware)

components/
├── ui/
│   ├── Button.tsx             # Reusable button component
│   └── Input.tsx              # Reusable input component
├── Navbar.tsx                 # Auth-aware navigation
└── CreatePostForm.tsx         # Updated with auth headers

lib/
├── auth.tsx                   # Authentication context & hooks
└── supabaseClient.ts          # Updated Supabase config

api/
└── posts/
    └── route.ts               # Updated with authentication
```

## Key Components

### Authentication Context (`lib/auth.tsx`)
Provides authentication state and methods throughout the app:
- `useAuth()` - Get current user and auth methods
- `useRequireAuth()` - Redirect to login if not authenticated

### Protected Routes
Pages that require authentication automatically redirect to login:
- Dashboard
- Create Listing

### API Authentication
API endpoints now require authentication headers:
```javascript
headers: {
  'Authorization': `Bearer ${session?.access_token}`
}
```

## Troubleshooting

### Common Issues

1. **"Invalid authentication" errors**
   - Check that SUPABASE_SERVICE_ROLE_KEY is set correctly
   - Verify the user is logged in before making API calls

2. **Redirect loops on protected routes**
   - Check that the auth context is properly wrapped around the app
   - Verify Supabase client configuration

3. **Email confirmation not working**
   - Check SMTP settings in Supabase
   - For development, disable email confirmation

4. **RLS policies blocking access**
   - Verify policies are correctly set up
   - Check that `owner` field matches `auth.uid()`

### Development Tips

1. **Testing without email confirmation:**
   ```sql
   -- Disable email confirmation for development
   update auth.users set email_confirmed_at = now() where email_confirmed_at is null;
   ```

2. **Reset user password manually:**
   ```sql
   -- In Supabase SQL editor
   update auth.users set encrypted_password = crypt('newpassword', gen_salt('bf')) where email = 'user@example.com';
   ```

## Next Steps

- Set up email templates in Supabase
- Add social authentication (Google, GitHub, etc.)
- Implement user profiles
- Add password strength requirements
- Set up proper error handling and user feedback
