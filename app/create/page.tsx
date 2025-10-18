'use client'

import { CreatePostForm } from '@/components/CreatePostForm'
import { useRequireAuth } from '@/lib/auth'

export default function CreatePage() {
  const { user, loading } = useRequireAuth()

  if (loading) {
    return (
      <div className="min-h-screen py-8" style={{
        backgroundImage: 'linear-gradient(rgba(249, 250, 251, 0.95), rgba(249, 250, 251, 0.95)), url(/images/hero/bg3.png)',
        backgroundSize: 'auto, 150px 150px',
        backgroundRepeat: 'no-repeat, repeat',
        backgroundColor: '#f9fafb'
      }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-xl p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{
      backgroundImage: 'linear-gradient(rgba(249, 250, 251, 0.95), rgba(249, 250, 251, 0.95)), url(/images/hero/bg3.png)',
      backgroundSize: 'auto, 150px 150px',
      backgroundRepeat: 'no-repeat, repeat',
      backgroundColor: '#f9fafb'
    }}>
      <CreatePostForm />
    </div>
  )
}
