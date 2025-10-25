'use client'

import { ArrowLeft, HelpCircle, Mail, MessageCircle, Book, Phone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function SupportPage() {
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-600">Get answers to your questions and learn how to use A2Z</p>
        </div>

        {/* Help Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Book className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Getting Started</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Learn the basics of creating and managing your listings
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• How to create your first listing</li>
                  <li>• Understanding tier limits</li>
                  <li>• Uploading images and videos</li>
                  <li>• Sharing your listings</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Premium Features</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Unlock advanced features with Premium or Business plans
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Unlimited listings</li>
                  <li>• Verified seller badge</li>
                  <li>• Advanced gallery options</li>
                  <li>• No expiration dates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How long do my listings stay active?</h3>
              <p className="text-sm text-gray-600">
                Free tier listings expire after 7 days. Premium listings stay active for 35 days, and Business listings for 60 days.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">How many images can I upload?</h3>
              <p className="text-sm text-gray-600">
                Free tier allows 5 images per listing. Premium allows 8 images, and Business allows up to 20 images.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade my plan later?</h3>
              <p className="text-sm text-gray-600">
                Yes! You can upgrade to Premium or Business at any time. Your existing listings will automatically get the benefits of your new tier.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What is the Early Adopter program?</h3>
              <p className="text-sm text-gray-600">
                The first 500 users get special discounted pricing: Premium for R29/month (regular R49) and Business for R99/month (regular R179).
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-8 text-center text-white">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-2">Still need support?</h2>
          <p className="mb-6 opacity-90">Our support team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-white text-emerald-600 hover:bg-gray-100"
              onClick={() => {
                const message = encodeURIComponent('Hi! I need support with A2Z Marketplace.')
                window.open(`https://wa.me/27714329190?text=${message}`, '_blank')
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Support
            </Button>
            <Button 
              className="bg-white text-emerald-600 hover:bg-gray-100"
              onClick={() => window.open('tel:0714329190', '_self')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
