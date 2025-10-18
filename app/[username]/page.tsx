import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { PostCard } from '@/components/PostCard'
import type { Metadata } from 'next'

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey)

interface PageProps {
  params: Promise<{ username: string }>
}

async function getUserProfile(username: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    return null
  }

  return profile
}

async function getUserPosts(userId: string) {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('owner', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return []
  }

  return posts
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const profile = await getUserProfile(username)

  if (!profile) {
    return {
      title: 'User Not Found - Sellr',
    }
  }

  return {
    title: `${profile.display_name || username} - Sellr`,
    description: profile.bio || `Check out ${profile.display_name || username}'s listings on Sellr`,
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params
  const profile = await getUserProfile(username)

  if (!profile) {
    notFound()
  }

  const posts = await getUserPosts(profile.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || username}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                {(profile.display_name || username).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.display_name || username}
              </h1>
              <p className="text-gray-600">@{username}</p>
              {profile.bio && (
                <p className="mt-2 text-gray-700">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Listings ({posts.length})
        </h2>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">No listings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/${username}/${post.slug}`}
                className="block hover:scale-105 transition-transform"
              >
                <PostCard post={post} trackViews={false} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center pb-8">
        <Link
          href="/"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
        >
          ← Create your own profile on Sellr
        </Link>
      </div>
    </div>
  )
}
