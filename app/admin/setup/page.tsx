'use client'

import { useState } from 'react'

export default function AdminSetupPage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults(prev => [...prev, message])
  }

  const setupTrigger = async () => {
    setLoading(true)
    addResult('🔧 Setting up database trigger...')

    try {
      const response = await fetch('/api/admin/setup-trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        addResult('✅ Database trigger created successfully!')
      } else {
        addResult(`❌ Trigger setup failed: ${data.error}`)
      }
    } catch (error) {
      addResult(`❌ Network Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const updateCurrentUser = async () => {
    setLoading(true)
    addResult('👤 Updating current user profile...')

    try {
      const response = await fetch('/api/admin/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'd70d6ca8-4539-4d2b-b528-86af1b0c7c5f',
          tier: 'premium',
          subscription_status: 'trial',
          early_adopter: true,
          verified_seller: true
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        addResult('✅ Your profile updated to Premium!')
      } else {
        addResult(`❌ Profile update failed: ${data.error}`)
      }
    } catch (error) {
      addResult(`❌ Network Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">A2Z Admin Setup</h1>
        
        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h2 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h2>
            <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
              <li>First, disable email confirmation in Supabase Dashboard</li>
              <li>Click "Setup Database Trigger" below</li>
              <li>Click "Update Current User" to fix your profile</li>
              <li>Test by creating a new account with Premium/Business</li>
            </ol>
          </div>

          <button
            onClick={setupTrigger}
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            🔧 Setup Database Trigger
          </button>
          
          <button
            onClick={updateCurrentUser}
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
          >
            👤 Update Current User to Premium
          </button>

          <button
            onClick={clearResults}
            className="w-full py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Clear Results
          </button>
        </div>

        {loading && (
          <div className="mb-4 text-center text-blue-600 font-medium">
            Processing...
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Results:</h3>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>What this does:</strong><br/>
          • Creates a database trigger that runs when users sign up<br/>
          • Automatically reads the selected_plan from auth metadata<br/>
          • Creates profiles with correct tier, trial periods, and badges<br/>
          • No more manual profile updates needed!
        </div>
      </div>
    </div>
  )
}
