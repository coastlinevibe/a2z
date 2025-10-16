'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const EMOJI_TAG_PRESETS = [
  '🌸 Handmade',
  '🍖 Meat',
  '🥭 Fresh Produce',
  '🧵 Crafts',
  '🍩 Baked',
  '🪵 Furniture',
  '🎁 Gifts',
  '👕 Clothing',
  '📱 Electronics',
  '🏠 Home & Garden',
  '🚗 Automotive',
  '📚 Books',
  '🎮 Gaming',
  '💄 Beauty',
  '🏃 Sports',
  '🎵 Music',
]

interface EmojiTagsProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  maxTags?: number
  className?: string
}

export function EmojiTags({ 
  selectedTags, 
  onTagsChange, 
  maxTags = 4,
  className 
}: EmojiTagsProps) {
  const [customTag, setCustomTag] = useState('')

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else if (selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, tag])
    }
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim()) && selectedTags.length < maxTags) {
      onTagsChange([...selectedTags, customTag.trim()])
      setCustomTag('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomTag()
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Emoji Tags ({selectedTags.length}/{maxTags})
        </label>
        
        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                {tag}
                <span className="ml-1 text-emerald-600">×</span>
              </button>
            ))}
          </div>
        )}

        {/* Preset tags */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {EMOJI_TAG_PRESETS.map((tag) => {
            const isSelected = selectedTags.includes(tag)
            const isDisabled = !isSelected && selectedTags.length >= maxTags
            
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                disabled={isDisabled}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg border transition-all',
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : isDisabled
                    ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>

        {/* Custom tag input */}
        {selectedTags.length < maxTags && (
          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add custom tag (e.g., 🎨 Art)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              maxLength={20}
            />
            <button
              onClick={addCustomTag}
              disabled={!customTag.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
