'use client'

import { useState } from 'react'

export default function UpdateProfilePage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const updateProfile = async (tier: 'free' | 'premium' | 'business') => {
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'd70d6ca8-4539-4d2b-b528-86af1b0c7c5f', // Your user ID
          tier,
          subscription_status: tier === 'free' ? 'active' : 'trial',
          early_adopter: tier !== 'free',
          verified_seller: tier !== 'free'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(`✅ Success: ${data.message}`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Update Profile</h1>
        
        <div className="space-y-4">
          <button
            onClick={() => updateProfile('free')}
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Set to Free
          </button>
          
          <button
            onClick={() => updateProfile('premium')}
            disabled={loading}
            className="w-full py-2 px-4 bg-emerald-500 text-white rounded hover:bg-emerald-600 disabled:opacity-50"
          >
            Set to Premium
          </button>
          
          <button
            onClick={() => updateProfile('business')}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Set to Business
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-center text-gray-600">
            Updating profile...
          </div>
        )}

        {result && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            {result}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          User ID: d70d6ca8-4539-4d2b-b528-86af1b0c7c5f
        </div>
      </div>
    </div>
  )
}
