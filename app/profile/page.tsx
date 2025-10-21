'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Upload, User, Mail, AtSign, FileText, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface UserProfile {
  id: string
  display_name: string | null
  username: string | null
  bio: string | null
  avatar_url: string | null
  subscription_tier: 'free' | 'premium' | 'business'
  verified_seller: boolean
  early_adopter: boolean
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form fields
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login-animated')
      return
    }
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      setProfile(data)
      setDisplayName(data.display_name || '')
      setUsername(data.username || '')
      setBio(data.bio || '')
      setAvatarUrl(data.avatar_url || '')
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL immediately
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      fetchProfile()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFile || !user) return

    console.log('Starting upload:', { fileName: selectedFile.name, fileSize: selectedFile.size, fileType: selectedFile.type })

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' })
      return
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      console.log('Uploading to:', filePath)

      // First check if bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
      console.log('Available buckets:', buckets?.map(b => b.name))

      // Upload to Supabase Storage (profile bucket has RLS restrictions)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      console.log('Upload result:', { uploadData, uploadError })

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath)

      console.log('Public URL:', data.publicUrl)

      // Clean up preview URL and set final URL
      if (previewUrl) URL.revokeObjectURL(previewUrl)

      // Update avatar URL in state
      setAvatarUrl(data.publicUrl)
      
      // Automatically save to database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Clean up and refresh
      setSelectedFile(null)
      setPreviewUrl(null)
      setMessage({ type: 'success', text: 'Avatar updated successfully!' })
      
      // Refresh profile data
      fetchProfile()
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to upload image' 
      })
    } finally {
      setUploading(false)
    }
  }

  const getTierBadge = () => {
    const badges = {
      free: { text: 'Free', className: 'bg-gray-100 text-gray-700' },
      premium: { text: 'Premium', className: 'bg-emerald-100 text-emerald-700' },
      business: { text: 'Business', className: 'bg-blue-100 text-blue-700' }
    }
    return badges[profile?.subscription_tier || 'free']
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    )
  }

  const tierBadge = getTierBadge()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center text-xl font-bold text-emerald-600 ${avatarUrl ? 'hidden' : ''}`}>
                {displayName ? displayName[0].toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">
                  {displayName || user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-emerald-100 text-sm">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge className={`${tierBadge.className} border-0 text-xs py-0.5`}>
                    {tierBadge.text}
                  </Badge>
                  {profile?.verified_seller && (
                    <Badge className="bg-blue-100 text-blue-700 border-0 text-xs py-0.5">
                      Verified Seller
                    </Badge>
                  )}
                  {profile?.early_adopter && (
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs py-0.5">
                      Early Adopter
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {/* Message */}
            {message && (
              <div className={`p-4 rounded-lg mb-6 ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is how your name will appear to other users
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <AtSign className="w-4 h-4" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your unique username for your listing URL: a2z.co.za/{username || 'username'}
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bio.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Upload className="w-4 h-4" />
                Profile Picture
              </label>
              
              {/* Preview Thumbnail */}
              {(previewUrl || avatarUrl) && (
                <div className="mb-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <img 
                    src={previewUrl || avatarUrl} 
                    alt="Avatar preview" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="14"%3EError%3C/text%3E%3C/svg%3E'
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {previewUrl ? 'Ready to Upload' : 'Current Avatar'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {previewUrl 
                        ? 'Click "Upload" to save to your profile' 
                        : 'Your current profile picture'
                      }
                    </p>
                  </div>
                  {previewUrl && (
                    <button 
                      onClick={handleImageUpload}
                      disabled={uploading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Submit'}
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading}
                  />
                  <div className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    uploading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  } text-white`}>
                    <Upload className="w-4 h-4" />
                    Select Image
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter a URL or upload an image (max 5MB)
              </p>
            </div>

                {/* Account Email (Read-only) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t border-gray-200 mt-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Cancel
              </Button>
            </div>

            {/* Upgrade Section */}
            {profile?.subscription_tier === 'free' && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900">Upgrade to Premium</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Get unlimited listings, verified seller badge, and more!
                    </p>
                    <Link href="/pricing">
                      <Button className="mt-3 bg-amber-600 hover:bg-amber-700 text-white">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
