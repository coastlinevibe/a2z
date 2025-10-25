'use client'

import { MessageCircle, Phone } from 'lucide-react'
import { useState } from 'react'

export function SupportButton() {
  const [isOpen, setIsOpen] = useState(false)
  const whatsappNumber = '27714329190' // Your number in international format
  const phoneNumber = '0714329190'

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hi! I need support with A2Z Marketplace.')
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  const handlePhoneClick = () => {
    window.open(`tel:${phoneNumber}`, '_self')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Support Options Menu */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]">
          <h3 className="font-semibold text-gray-900 mb-3">Contact Support</h3>
          <div className="space-y-2">
            <button
              onClick={handleWhatsAppClick}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">WhatsApp</div>
                <div className="text-sm text-gray-600">Chat with us</div>
              </div>
            </button>
            
            <button
              onClick={handlePhoneClick}
              className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Call Us</div>
                <div className="text-sm text-gray-600">{phoneNumber}</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Support Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-200"
        aria-label="Contact Support"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  )
}
