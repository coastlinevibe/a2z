import crypto from 'crypto'
import { PAYFAST_CONFIG } from './config'

export interface PayFastPaymentData {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first?: string
  email_address: string
  m_payment_id: string
  amount: string
  item_name: string
  item_description?: string
  custom_str1?: string
  custom_str2?: string
  custom_str3?: string
  signature: string
}

/**
 * Generate PayFast payment form data with signature
 */
export function generatePayFastData(params: {
  amount: number // in cents
  transactionReference: string
  customerEmail: string
  customerName?: string
  tier: string
}): PayFastPaymentData {
  const { amount, transactionReference, customerEmail, customerName, tier } = params
  
  const amountInRands = (amount / 100).toFixed(2)
  
  const data: Omit<PayFastPaymentData, 'signature'> = {
    merchant_id: PAYFAST_CONFIG.merchantId,
    merchant_key: PAYFAST_CONFIG.merchantKey,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/payfast`,
    name_first: customerName || 'Customer',
    email_address: customerEmail,
    m_payment_id: transactionReference,
    amount: amountInRands,
    item_name: `A2Z ${tier.charAt(0).toUpperCase() + tier.slice(1)} Subscription`,
    item_description: `Monthly subscription to A2Z ${tier} plan`,
    custom_str1: tier,
    custom_str2: transactionReference,
  }

  // Generate signature
  const signature = generateSignature(data)

  return {
    ...data,
    signature
  }
}

/**
 * Generate MD5 signature for PayFast
 */
export function generateSignature(data: Omit<PayFastPaymentData, 'signature'>): string {
  // Create parameter string
  let paramString = ''
  const sortedKeys = Object.keys(data).sort()
  
  for (const key of sortedKeys) {
    const value = data[key as keyof typeof data]
    if (value !== undefined && value !== '') {
      paramString += `${key}=${encodeURIComponent(value.toString().trim()).replace(/%20/g, '+')}&`
    }
  }
  
  // Remove last ampersand
  paramString = paramString.slice(0, -1)
  
  // Add passphrase if in production
  if (PAYFAST_CONFIG.passphrase) {
    paramString += `&passphrase=${encodeURIComponent(PAYFAST_CONFIG.passphrase.trim()).replace(/%20/g, '+')}`
  }
  
  // Generate MD5 hash
  return crypto.createHash('md5').update(paramString).digest('hex')
}

/**
 * Verify PayFast webhook signature
 */
export function verifyPayFastSignature(data: any, receivedSignature: string): boolean {
  const { signature, ...dataWithoutSignature } = data
  const calculatedSignature = generateSignature(dataWithoutSignature)
  return calculatedSignature === receivedSignature
}

/**
 * Verify PayFast server IP (security check)
 */
export function verifyPayFastIP(ip: string): boolean {
  const validIPs = [
    '197.97.145.144',
    '197.97.145.145',
    '197.97.145.146',
    '197.97.145.147',
    '197.97.145.148',
    '41.74.179.194',
    '41.74.179.195',
    '41.74.179.196',
    '41.74.179.197',
    '41.74.179.198',
    '41.74.179.199'
  ]
  
  // In test mode, allow localhost
  if (PAYFAST_CONFIG.isTest && (ip === '127.0.0.1' || ip === '::1')) {
    return true
  }
  
  return validIPs.includes(ip)
}

/**
 * Parse PayFast payment status
 */
export function parsePayFastStatus(status: string): 'completed' | 'failed' | 'cancelled' | 'pending' {
  const statusMap: Record<string, 'completed' | 'failed' | 'cancelled' | 'pending'> = {
    'COMPLETE': 'completed',
    'CANCELLED': 'cancelled',
    'FAILED': 'failed',
    'PENDING': 'pending'
  }
  
  return statusMap[status.toUpperCase()] || 'pending'
}
