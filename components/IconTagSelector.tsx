'use client'

import { useState } from 'react'
import { 
  Home, 
  Car, 
  Smartphone, 
  Shirt, 
  Sofa, 
  Laptop, 
  Watch, 
  Camera, 
  Headphones, 
  Book,
  Bike,
  Dumbbell,
  Baby,
  PawPrint,
  Utensils,
  Gamepad2,
  Music,
  Paintbrush,
  Wrench,
  Sparkles,
  Heart,
  Star,
  Zap,
  Gift,
  Plus,
  Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Tag {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
}

const AVAILABLE_TAGS: Tag[] = [
  { id: 'home', icon: Home, label: 'Home & Garden', color: 'from-emerald-400 to-emerald-600' },
  { id: 'car', icon: Car, label: 'Vehicles', color: 'from-teal-400 to-teal-600' },
  { id: 'phone', icon: Smartphone, label: 'Electronics', color: 'from-cyan-400 to-cyan-600' },
  { id: 'fashion', icon: Shirt, label: 'Fashion', color: 'from-emerald-400 to-teal-600' },
  { id: 'furniture', icon: Sofa, label: 'Furniture', color: 'from-teal-400 to-cyan-600' },
  { id: 'computer', icon: Laptop, label: 'Computers', color: 'from-cyan-400 to-blue-600' },
  { id: 'watch', icon: Watch, label: 'Accessories', color: 'from-emerald-500 to-teal-500' },
  { id: 'camera', icon: Camera, label: 'Photography', color: 'from-teal-500 to-cyan-500' },
  { id: 'audio', icon: Headphones, label: 'Audio', color: 'from-cyan-500 to-blue-500' },
  { id: 'books', icon: Book, label: 'Books', color: 'from-emerald-400 to-green-600' },
  { id: 'bike', icon: Bike, label: 'Sports', color: 'from-green-400 to-emerald-600' },
  { id: 'fitness', icon: Dumbbell, label: 'Fitness', color: 'from-teal-400 to-emerald-600' },
  { id: 'baby', icon: Baby, label: 'Baby & Kids', color: 'from-cyan-400 to-teal-600' },
  { id: 'pets', icon: PawPrint, label: 'Pets', color: 'from-emerald-500 to-cyan-500' },
  { id: 'food', icon: Utensils, label: 'Food & Drink', color: 'from-green-400 to-teal-600' },
  { id: 'gaming', icon: Gamepad2, label: 'Gaming', color: 'from-teal-500 to-blue-500' },
  { id: 'music', icon: Music, label: 'Music', color: 'from-cyan-500 to-emerald-500' },
  { id: 'art', icon: Paintbrush, label: 'Art & Crafts', color: 'from-emerald-400 to-cyan-600' },
  { id: 'tools', icon: Wrench, label: 'Tools', color: 'from-teal-500 to-cyan-600' },
  { id: 'new', icon: Sparkles, label: 'Brand New', color: 'from-emerald-300 to-teal-500' },
  { id: 'favorite', icon: Heart, label: 'Favorite', color: 'from-teal-400 to-emerald-600' },
  { id: 'featured', icon: Star, label: 'Featured', color: 'from-cyan-400 to-emerald-600' },
  { id: 'trending', icon: Zap, label: 'Trending', color: 'from-emerald-500 to-cyan-600' },
  { id: 'gift', icon: Gift, label: 'Gift Idea', color: 'from-teal-500 to-emerald-600' },
]

interface IconTagSelectorProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
}

export function IconTagSelector({ selectedTags, onChange, maxTags = 5 }: IconTagSelectorProps) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null)
  const [showAddTag, setShowAddTag] = useState(false)
  const [customTagLabel, setCustomTagLabel] = useState('')
  const [customTags, setCustomTags] = useState<Tag[]>([])

  const allTags = [...AVAILABLE_TAGS, ...customTags]

  const addCustomTag = () => {
    if (!customTagLabel.trim()) return
    
    const newTag: Tag = {
      id: `custom-${Date.now()}`,
      icon: Tag,
      label: customTagLabel.trim(),
      color: 'from-emerald-400 to-teal-600'
    }
    
    setCustomTags([...customTags, newTag])
    onChange([...selectedTags, newTag.id])
    setCustomTagLabel('')
    setShowAddTag(false)
  }

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter(id => id !== tagId))
    } else if (selectedTags.length < maxTags) {
      onChange([...selectedTags, tagId])
    }
  }

  const isSelected = (tagId: string) => selectedTags.includes(tagId)
  const isMaxReached = selectedTags.length >= maxTags

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Category Tags <span className="text-red-500">*</span>
        </label>
        <span className="text-xs text-gray-500">
          {selectedTags.length}/{maxTags} selected
        </span>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
        {allTags.map((tag) => {
          const Icon = tag.icon
          const selected = isSelected(tag.id)
          const disabled = !selected && isMaxReached

          return (
            <div key={tag.id} className="relative group">
              <button
                type="button"
                onClick={() => !disabled && toggleTag(tag.id)}
                onMouseEnter={() => setHoveredTag(tag.id)}
                onMouseLeave={() => setHoveredTag(null)}
                disabled={disabled}
                className={cn(
                  "relative w-full aspect-square rounded-xl transition-all duration-300",
                  "flex items-center justify-center",
                  "border-2 overflow-hidden",
                  selected
                    ? `bg-gradient-to-br ${tag.color} border-transparent shadow-lg scale-105`
                    : disabled
                    ? "bg-gray-100 border-gray-200 opacity-40 cursor-not-allowed"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-105"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    selected 
                      ? "text-white" 
                      : disabled
                      ? "text-gray-400"
                      : "text-emerald-600"
                  )} 
                />
                
                {/* Selection indicator */}
                {selected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                )}
              </button>

              {/* Tooltip on hover */}
              {hoveredTag === tag.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-xl animate-in fade-in slide-in-from-bottom-1 duration-200">
                  {tag.label}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          )
        })}
        
        {/* Add Custom Tag Button */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => setShowAddTag(true)}
            disabled={isMaxReached}
            onMouseEnter={() => setHoveredTag('add-tag')}
            onMouseLeave={() => setHoveredTag(null)}
            className={cn(
              "relative w-full aspect-square rounded-xl transition-all duration-300",
              "flex items-center justify-center",
              "border-2 border-dashed",
              isMaxReached
                ? "bg-gray-100 border-gray-200 opacity-40 cursor-not-allowed"
                : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 hover:border-emerald-400 hover:shadow-md hover:scale-105"
            )}
          >
            <Plus className={cn(
              "h-5 w-5 transition-colors",
              isMaxReached ? "text-gray-400" : "text-emerald-600"
            )} />
          </button>

          {/* Tooltip */}
          {hoveredTag === 'add-tag' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 shadow-xl animate-in fade-in slide-in-from-bottom-1 duration-200">
              Add Custom Tag
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
            </div>
          )}
        </div>
      </div>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          {selectedTags.map((tagId) => {
            const tag = allTags.find(t => t.id === tagId)
            if (!tag) return null
            const Icon = tag.icon

            return (
              <div
                key={tagId}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white",
                  `bg-gradient-to-r ${tag.color} shadow-sm`
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => toggleTag(tagId)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Tag Modal */}
      {showAddTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddTag(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Custom Tag</h3>
              <button
                type="button"
                onClick={() => setShowAddTag(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={customTagLabel}
                  onChange={(e) => setCustomTagLabel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTag()}
                  placeholder="e.g., Vintage, Handmade, Limited Edition"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTag(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={!customTagLabel.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
