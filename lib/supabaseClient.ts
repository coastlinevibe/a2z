import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          owner: string
          title: string
          price_cents: number
          currency: string
          description: string | null
          emoji_tags: string[]
          media_urls: string[]
          media_descriptions: string[]
          slug: string
          is_active: boolean
          views: number
          clicks: number
          whatsapp_number: string | null
          location: string | null
          display_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner: string
          title: string
          price_cents: number
          currency?: string
          description?: string | null
          emoji_tags?: string[]
          media_urls: string[]
          media_descriptions?: string[]
          slug: string
          is_active?: boolean
          views?: number
          clicks?: number
          whatsapp_number?: string | null
          location?: string | null
          display_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner?: string
          title?: string
          price_cents?: number
          currency?: string
          description?: string | null
          emoji_tags?: string[]
          media_urls?: string[]
          media_descriptions?: string[]
          slug?: string
          is_active?: boolean
          views?: number
          clicks?: number
          whatsapp_number?: string | null
          location?: string | null
          display_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
