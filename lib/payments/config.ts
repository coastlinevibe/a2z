// Payment provider configuration for A2Z

export const PAYMENT_PROVIDERS = {
  PAYFAST: 'payfast',
  EFT: 'eft',
} as const

export type PaymentProvider = typeof PAYMENT_PROVIDERS[keyof typeof PAYMENT_PROVIDERS]

// PayFast Configuration
export const PAYFAST_CONFIG = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passphrase: process.env.PAYFAST_PASSPHRASE || '',
  isTest: process.env.PAYFAST_IS_TEST === 'true',
  apiUrl: process.env.PAYFAST_IS_TEST === 'true'
    ? 'https://sandbox.payfast.co.za'
    : 'https://www.payfast.co.za',
  processUrl: process.env.PAYFAST_IS_TEST === 'true'
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process'
}

// Pricing in South African Rands (cents)
export const PRICING = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'ZAR',
    features: ['3 listings', '5 images', '7 days expiry']
  },
  premium: {
    name: 'Premium',
    price: 4900, // R49.00
    earlyAdopterPrice: 2900, // R29.00
    currency: 'ZAR',
    interval: 'month',
    features: ['Unlimited listings', '8 images', '35 days expiry', 'Verified badge']
  },
  business: {
    name: 'Business',
    price: 17900, // R179.00
    earlyAdopterPrice: 9900, // R99.00
    currency: 'ZAR',
    interval: 'month',
    features: ['20 images', 'Custom branding', 'Team access', '60 days expiry']
  }
} as const

export type SubscriptionTier = keyof typeof PRICING

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]

// Helper to format price
export function formatPrice(cents: number, currency: string = 'ZAR'): string {
  const amount = cents / 100
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
