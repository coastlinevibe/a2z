'use client'

import { useEffect, useRef, useState } from 'react'
import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Emoji from '@tiptap/extension-emoji'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import { Truck } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  deliveryAvailable?: boolean
  onDeliveryChange?: (available: boolean) => void
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Describe your product, condition, features, etc.',
  deliveryAvailable = false,
  onDeliveryChange,
}: RichTextEditorProps) {
  const [showPicker, setShowPicker] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Underline,
      Emoji.configure({
        enableEmoticons: true,
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }: { editor: Editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class:
          'tiptap min-h-[160px] border rounded-lg bg-white p-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm',
      },
    },
  })

  const handleEmojiSelect = (emoji: any) => {
    if (!editor) return
    const symbol = emoji?.native || emoji?.emoji || emoji?.shortcodes
    if (!symbol) return
    editor.chain().focus().insertContent(symbol).run()
    setShowPicker(false)
  }

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '', false)
    }
  }, [editor, value])

  useEffect(() => {
    if (!showPicker) return

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  if (!editor) return null

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="mb-2 flex flex-wrap items-center gap-2 border-b pb-2 text-sm">
        <button
          type="button"
          onClick={() => setShowPicker((prev) => !prev)}
          className={`px-2 py-1 text-xl leading-none rounded hover:bg-gray-100 ${
            showPicker ? 'bg-gray-200' : ''
          }`}
          aria-label="Insert emoji"
          aria-expanded={showPicker}
        >
          😄
        </button>
        <button
          type="button"
          className={`px-2 py-1 rounded hover:bg-gray-100 font-semibold ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          B
        </button>
        <button
          type="button"
          className={`px-2 py-1 rounded hover:bg-gray-100 italic ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          I
        </button>
        <button
          type="button"
          className={`px-2 py-1 rounded hover:bg-gray-100 underline ${
            editor.isActive('underline') ? 'bg-gray-200' : ''
          }`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          U
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded hover:bg-gray-100"
          onClick={() => {
            const url = window.prompt('Enter URL')
            if (!url) return
            editor.chain().focus().setLink({ href: url }).run()
          }}
        >
          🔗
        </button>
        <button
          type="button"
          className="px-2 py-1 rounded hover:bg-gray-100"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          ❌ Clear
        </button>
        
        {onDeliveryChange && (
          <button
            type="button"
            className={`ml-auto px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors ${
              deliveryAvailable 
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => onDeliveryChange(!deliveryAvailable)}
            title={deliveryAvailable ? 'Delivery available' : 'No delivery'}
          >
            <Truck className="h-4 w-4" />
            <span className="text-xs font-medium">
              {deliveryAvailable ? 'Delivery ON' : 'Delivery OFF'}
            </span>
          </button>
        )}
      </div>

      <EditorContent editor={editor} />

      <p className="mt-1 text-xs text-gray-400">
        Tip: Add emojis 😄 and links to make your listing stand out.
      </p>

      {showPicker && (
        <div className="absolute left-0 bottom-[calc(100%+0.75rem)] z-50 w-[32rem] max-w-[98vw] rounded-lg border bg-white shadow-lg sm:w-[34rem]">
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
            previewPosition="none"
            skinTonePosition="none"
            perLine={14}
            dynamicWidth={false}
          />
        </div>
      )}
    </div>
  )
}
