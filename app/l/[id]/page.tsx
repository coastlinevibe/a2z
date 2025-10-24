import { notFound, redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface PageProps {
  params: Promise<{ id: string }>
}

async function getPostBySlug(slug: string) {
  // Get post with profile data
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_owner_fkey (
        username
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .limit(1)
  
  if (error || !posts || posts.length === 0) {
    return null
  }
  
  return posts[0]
}

export default async function ShortLinkPage({ params }: PageProps) {
  const { id } = await params
  
  // Get the post by slug
  const post = await getPostBySlug(id)
  
  if (!post || !post.profiles?.username) {
    notFound()
  }
  
  // Redirect to the full URL format
  redirect(`/u/${post.profiles.username}/${post.slug}`)
}
