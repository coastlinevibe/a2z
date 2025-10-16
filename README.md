# 🚀 A2Z - Everything A to Z. No Store Needed.

A WhatsApp-native micro-commerce platform that lets you turn your photos into sales instantly. Create beautiful listings and share them instantly on WhatsApp.

A2Z is a WhatsApp-native micro-commerce platform built for South African sellers. Create professional-looking product listings in minutes and share them seamlessly in WhatsApp groups and chats.

## ✨ Features

- **📱 Mobile-First Design** - Perfect on the devices where selling actually happens
- **⚡ Lightning Fast** - Create listings in under 2 minutes
- **💬 WhatsApp Native** - Optimized for WhatsApp sharing with beautiful previews
- **🎨 Beautiful Cards** - Professional-looking product cards that convert
- **📊 Analytics** - Track views and clicks on your listings
- **🏷️ Emoji Tags** - Categorize products with fun, visual tags
- **📸 Media Support** - Upload multiple images or videos
- **🔗 Shareable Links** - Get short, memorable URLs for your products
- **💰 ZAR Support** - Built for South African sellers with local currency
- **🆓 Always Free** - No hidden costs or transaction fees

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- A Supabase account and project
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd sellr
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Setup

Copy the environment template:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration  
SELLR_BASE_URL=http://localhost:3000
```

### 4. Supabase Setup

#### Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL commands from `supabase-schema.sql`:

```sql
-- Create posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null,
  title text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'ZAR',
  description text,
  emoji_tags text[] default '{}',
  media_urls text[] not null default '{}',
  slug text unique not null,
  is_active boolean not null default true,
  views integer not null default 0,
  clicks integer not null default 0,
  whatsapp_number text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes and RLS policies (see full schema file)
```

#### Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `posts`
3. Set it as **Public**
4. Configure these settings:
   - File size limit: 10MB
   - Allowed MIME types: `image/*`, `video/mp4`, `video/webm`

### 5. Run the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app! 🎉

## 📁 Project Structure

```
sellr/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   │   ├── posts/               # Posts CRUD operations
│   │   └── upload/              # File upload handling
│   ├── create/                  # Create listing page
│   ├── dashboard/               # User dashboard
│   ├── p/[slug]/               # Public listing pages
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── CreatePostForm.tsx      # Main listing creation form
│   ├── MediaUploader.tsx       # File upload component
│   ├── PostCard.tsx            # Product display card
│   ├── ShareModal.tsx          # Sharing functionality
│   ├── EmojiTags.tsx           # Tag selection
│   └── Navbar.tsx              # Navigation
├── lib/                        # Utilities and config
│   ├── supabaseClient.ts       # Supabase configuration
│   ├── validators.ts           # Zod schemas
│   ├── utils.ts                # Helper functions
│   └── analytics.ts            # Analytics tracking
└── supabase-schema.sql         # Database schema
```

## 🎯 Usage Guide

### Creating Your First Listing

1. **Navigate to Create** - Click "Create Listing" or go to `/create`
2. **Upload Media** - Add 1-5 images or 1 video (drag & drop supported)
3. **Fill Details**:
   - Product title (3-80 characters)
   - Price in ZAR (or other currencies)
   - Description (optional, up to 600 characters)
   - Emoji tags (up to 4 tags)
   - WhatsApp number (E.164 format: +27123456789)
   - Location (optional)
4. **Preview** - See how your listing will look in real-time
5. **Publish** - Click "Create Listing" to generate your shareable link

### Sharing Your Listing

After creating a listing, you'll get:
- **Public URL**: `https://yoursite.com/p/your-product-slug`
- **WhatsApp Message**: Pre-formatted message with emoji and link
- **Share Buttons**: One-click sharing to WhatsApp

### Managing Listings

Visit `/dashboard` to:
- View all your listings
- See analytics (views, clicks)
- Toggle listings active/inactive
- Edit or delete listings
- Quick share options

## 🔧 Configuration

### Emoji Tag Presets

Customize the available emoji tags in `components/EmojiTags.tsx`:

```typescript
const EMOJI_TAG_PRESETS = [
  '🌸 Handmade',
  '🍖 Meat', 
  '🥭 Fresh Produce',
  // Add your own...
]
```

### Currency Support

Add more currencies in `components/CreatePostForm.tsx`:

```typescript
<select {...register('currency')}>
  <option value="ZAR">ZAR</option>
  <option value="USD">USD</option>
  <option value="EUR">EUR</option>
  // Add more...
</select>
```

### File Upload Limits

Modify upload restrictions in `app/api/upload/route.ts`:

```typescript
// File size limit (default: 10MB)
if (fileSize > 10 * 1024 * 1024) {
  return NextResponse.json(
    { error: 'File size too large (max 10MB)' },
    { status: 400 }
  )
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**:
   ```bash
   vercel --prod
   ```

2. **Environment Variables**:
   Add these in your Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SELLR_BASE_URL` (your production URL)

3. **Custom Domain** (Optional):
   - Add your domain in Vercel dashboard
   - Update `SELLR_BASE_URL` to match

### Other Platforms

Sellr works on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Analytics & Tracking

Sellr includes built-in analytics:

- **View Tracking**: Automatic with 30-minute deduplication
- **Click Tracking**: WhatsApp and phone button clicks
- **Privacy-First**: No external tracking, data stays in your Supabase

View analytics in the dashboard or query directly:

```sql
SELECT 
  title,
  views,
  clicks,
  ROUND(clicks::float / NULLIF(views, 0) * 100, 2) as ctr
FROM posts 
ORDER BY views DESC;
```

## 🎨 Customization

### Styling

Sellr uses Tailwind CSS. Customize the design in:
- `app/globals.css` - Global styles and custom components
- `tailwind.config.js` - Theme configuration
- Individual components - Component-specific styling

### Branding

Update branding elements:
- Logo: `components/Navbar.tsx`
- Colors: Tailwind config (emerald theme)
- Copy: Page content and metadata

## 🔒 Security & Privacy

- **Row Level Security**: Enabled on all database tables
- **File Validation**: Type and size checking on uploads
- **Input Sanitization**: Zod validation on all forms
- **CORS Protection**: API routes protected
- **No Tracking**: Privacy-first analytics

## 🐛 Troubleshooting

### Common Issues

**"Module not found" errors**:
- Ensure all dependencies are installed: `npm install`
- Check TypeScript paths in `tsconfig.json`

**Supabase connection issues**:
- Verify environment variables are set correctly
- Check Supabase project URL and anon key
- Ensure RLS policies are properly configured

**File upload failures**:
- Confirm storage bucket is public
- Check file size and type restrictions
- Verify bucket permissions

**Build errors**:
- Run `npm run build` to check for TypeScript errors
- Ensure all imports are correct
- Check for missing dependencies

### Getting Help

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review Supabase logs for backend issues
3. Use browser dev tools for frontend debugging
4. Check Vercel function logs for deployment issues

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind for styling
- Add proper error handling
- Include JSDoc comments for complex functions
- Test on mobile devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- Icons by [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ for South African sellers**

*Sellr - Simple Selling. No Store Needed.*
#   a 2 z  
 