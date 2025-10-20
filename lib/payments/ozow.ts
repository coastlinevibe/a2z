import crypto from 'crypto'
import { OZOW_CONFIG } from './config'

export interface OzowPaymentRequest {
  siteCode: string
  countryCode: string
  currencyCode: string
  amount: string
  transactionReference: string
  bankReference: string
  customer: string
  cancelUrl: string
  errorUrl: string
  successUrl: string
  notifyUrl: string
  isTest: boolean
  hashCheck: string
}

export interface OzowPaymentResponse {
  url: string
  transactionId: string
  status: string
}

/**
 * Generate Ozow payment URL with proper hash
 */
export function generateOzowPaymentUrl(params: {
  amount: number // in cents
  transactionReference: string
  customerEmail: string
  tier: string
}): string {
  const { amount, transactionReference, customerEmail, tier } = params
  
  const amountInRands = (amount / 100).toFixed(2)
  
  const paymentData = {
    SiteCode: OZOW_CONFIG.siteCode,
    CountryCode: 'ZA',
    CurrencyCode: 'ZAR',
    Amount: amountInRands,
    TransactionReference: transactionReference,
    BankReference: `A2Z-${tier}-${transactionReference}`,
    Customer: customerEmail,
    CancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    ErrorUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/error`,
    SuccessUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    NotifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/ozow`,
    IsTest: OZOW_CONFIG.isTest ? 'true' : 'false'
  }

  // Generate hash check
  const hashString = `${paymentData.SiteCode}${paymentData.CountryCode}${paymentData.CurrencyCode}${paymentData.Amount}${paymentData.TransactionReference}${paymentData.BankReference}${OZOW_CONFIG.privateKey}`
  
  const hashCheck = crypto
    .createHash('sha512')
    .update(hashString.toLowerCase())
    .digest('hex')

  // Build URL with query parameters
  const params_url = new URLSearchParams({
    ...paymentData,
    HashCheck: hashCheck
  })

  return `${OZOW_CONFIG.paymentUrl}?${params_url.toString()}`
}

/**
 * Verify Ozow webhook signature
 */
export function verifyOzowWebhook(data: any, receivedHash: string): boolean {
  const hashString = `${data.SiteCode}${data.TransactionId}${data.TransactionReference}${data.Amount}${data.Status}${data.Optional1 || ''}${data.Optional2 || ''}${data.Optional3 || ''}${data.Optional4 || ''}${data.Optional5 || ''}${data.CurrencyCode}${data.IsTest}${data.StatusMessage}${OZOW_CONFIG.privateKey}`
  
  const calculatedHash = crypto
    .createHash('sha512')
    .update(hashString.toLowerCase())
    .digest('hex')

  return calculatedHash === receivedHash.toLowerCase()
}

/**
 * Parse Ozow payment status
 */
export function parseOzowStatus(status: string): 'completed' | 'failed' | 'cancelled' | 'pending' {
  const statusMap: Record<string, 'completed' | 'failed' | 'cancelled' | 'pending'> = {
    'Complete': 'completed',
    'Cancelled': 'cancelled',
    'Error': 'failed',
    'Pending': 'pending',
    'PendingInvestigation': 'pending'
  }
  
  return statusMap[status] || 'pending'
}
