import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Allowlisted HTML tags and attributes for rich text descriptions
const ALLOWED_HTML_TAGS = new Set([
  'b',
  'strong',
  'i',
  'em',
  'u',
  'p',
  'br',
  'span',
  'ol',
  'ul',
  'li',
  'a'
])

const ALLOWED_HTML_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
  span: ['data-name', 'data-type']
}

function isSafeUrl(url: string) {
  const trimmed = url.trim().toLowerCase()
  if (trimmed === '' || trimmed.startsWith('#')) return true
  return ['http:', 'https:', 'mailto:', 'tel:'].some((protocol) => trimmed.startsWith(protocol))
}

export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string' || html.trim() === '') {
    return ''
  }

  // Basic fallback for server-side rendering without DOM APIs
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return html
      .replace(/<\/(script|style|iframe)[^>]*>/gi, '')
      .replace(/<(script|style|iframe)[^>]*>/gi, '')
  }

  const template = document.createElement('template')
  template.innerHTML = html

  const sanitizeNode = (node: Element) => {
    const tagName = node.tagName.toLowerCase()

    if (!ALLOWED_HTML_TAGS.has(tagName)) {
      const fragment = document.createDocumentFragment()
      while (node.firstChild) {
        fragment.appendChild(node.firstChild)
      }
      node.replaceWith(fragment)
      return
    }

    const allowedAttrs = ALLOWED_HTML_ATTRIBUTES[tagName] ?? []
    Array.from(node.attributes).forEach((attr) => {
      const attrName = attr.name.toLowerCase()
      const isDataAttr = attrName.startsWith('data-')
      const isAllowed = allowedAttrs.includes(attrName) || isDataAttr

      if (!isAllowed) {
        node.removeAttribute(attr.name)
        return
      }

      if (tagName === 'a' && attrName === 'href' && !isSafeUrl(attr.value)) {
        node.removeAttribute(attr.name)
      }
      if (tagName === 'a' && attrName === 'target') {
        node.setAttribute('rel', 'noopener noreferrer')
      }
    })

    Array.from(node.children).forEach((child) => sanitizeNode(child))
  }

  Array.from(template.content.querySelectorAll('*')).forEach((el) => sanitizeNode(el as Element))

  return template.innerHTML
}

// Generate URL-friendly slug from title
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Generate unique slug by appending number if needed
export function generateUniqueSlug(title: string, existingSlugs: string[] = []): string {
  let baseSlug = slugify(title)
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// Format price for display
export function formatPrice(cents: number, currency: string = 'ZAR'): string {
  const amount = cents / 100
  
  // Use a consistent format to avoid hydration issues
  if (currency === 'ZAR') {
    return `R ${amount.toFixed(2)}`
  }
  
  // Fallback for other currencies
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

// Format date consistently to avoid hydration issues
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  // Use ISO format parts to avoid locale differences
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${day}/${month}/${year}`
}

// Format relative time consistently
export function formatRelativeTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`
  } else if (diffInHours < 24 * 7) {
    const days = Math.floor(diffInHours / 24)
    return `${days}d ago`
  } else {
    return formatDate(d)
  }
}

// Generate WhatsApp share URL
export function generateWhatsAppUrl(
  phoneNumber: string | null,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message)
  
  if (phoneNumber) {
    // Remove any non-digits and ensure it starts with +
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
  }
  
  // Generic WhatsApp share if no number provided
  return `https://wa.me/?text=${encodedMessage}`
}

// Generate share message for WhatsApp
export function generateShareMessage(
  title: string,
  price: string,
  publicUrl: string
): string {
  return `🔥 ${title} — ${price}\n👉 ${publicUrl}\n💬 Chat on WhatsApp`
}

// Compress image file
export function compressImage(file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback to original if compression fails
          }
        },
        file.type,
        quality
      )
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Validate file type
export function isValidFileType(file: File): boolean {
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const validVideoTypes = ['video/mp4', 'video/webm']
  
  return [...validImageTypes, ...validVideoTypes].includes(file.type)
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Gallery dimension requirements
export const GALLERY_DIMENSIONS = {
  hover: { minWidth: 600, minHeight: 600, idealWidth: 800, idealHeight: 800, aspectRatio: '1:1' },
  horizontal: { minWidth: 900, minHeight: 675, idealWidth: 1200, idealHeight: 900, aspectRatio: '4:3' },
  vertical: { minWidth: 675, minHeight: 900, idealWidth: 900, idealHeight: 1200, aspectRatio: '3:4' },
  gallery: { minWidth: 800, minHeight: 800, idealWidth: 1080, idealHeight: 1080, aspectRatio: '1:1' },
  before_after: { minWidth: 800, minHeight: 800, idealWidth: 1080, idealHeight: 1080, aspectRatio: '1:1' },
  video: { minWidth: 1280, minHeight: 720, idealWidth: 1920, idealHeight: 1080, aspectRatio: '16:9' }
} as const

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// Validate image dimensions for gallery type
export function validateImageDimensions(
  width: number,
  height: number,
  galleryType: keyof typeof GALLERY_DIMENSIONS
): { valid: boolean; message?: string } {
  const requirements = GALLERY_DIMENSIONS[galleryType]
  
  if (width < requirements.minWidth || height < requirements.minHeight) {
    return {
      valid: false,
      message: `📏 Image too small! Your image is ${width}×${height}px, but we need at least ${requirements.minWidth}×${requirements.minHeight}px for the best quality. Try uploading a larger image.`
    }
  }

  // Check aspect ratio within tolerance (5%)
  const expectedRatio = requirements.idealWidth / requirements.idealHeight
  const actualRatio = width / height
  const tolerance = 0.05 // 5%

  if (Math.abs(actualRatio - expectedRatio) / expectedRatio > tolerance) {
    return {
      valid: false,
      message: `📐 Image dimensions don't match! Your image is ${width}×${height}px, but for the best results we recommend ${requirements.idealWidth}×${requirements.idealHeight}px. Please resize your image or choose a different gallery style.`
    }
  }
  
  return { valid: true }
}

// Validate file size
export function validateFileSize(file: File): { valid: boolean; message?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `📁 File too large! Your file is ${formatFileSize(file.size)}, but we only allow files up to ${formatFileSize(MAX_FILE_SIZE)}. Please compress your image or choose a smaller file.`
    }
  }
  return { valid: true }
}

// Get image dimensions from file
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'))
      return
    }
    
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
}

// Show user-friendly notification
export function showNotification(message: string, type: 'error' | 'warning' | 'success' = 'error') {
  // Check if we're in a browser environment and have access to custom events
  if (typeof window !== 'undefined') {
    // Dispatch a custom event that the ToastProvider can listen to
    const event = new CustomEvent('showToast', {
      detail: { message, type }
    })
    window.dispatchEvent(event)
  } else {
    // Fallback for server-side or when toast system isn't available
    console.log(`${type.toUpperCase()}: ${message}`)
  }
}

// Image resizing utilities
export interface ResizeOptions {
  targetWidth: number
  targetHeight: number
  quality?: number
  maintainAspectRatio?: boolean
  cropMode?: 'center' | 'smart'
}

export interface ResizeResult {
  resizedFile: File
  originalDimensions: { width: number; height: number }
  newDimensions: { width: number; height: number }
  originalSize: number
  newSize: number
}

// Resize image to fit target dimensions
export function resizeImage(file: File, options: ResizeOptions): Promise<ResizeResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'))
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      const originalWidth = img.width
      const originalHeight = img.height
      const { targetWidth, targetHeight, quality = 0.9, maintainAspectRatio = true } = options

      let newWidth = targetWidth
      let newHeight = targetHeight
      let sourceX = 0
      let sourceY = 0
      let sourceWidth = originalWidth
      let sourceHeight = originalHeight

      if (maintainAspectRatio) {
        const originalRatio = originalWidth / originalHeight
        const targetRatio = targetWidth / targetHeight

        if (originalRatio > targetRatio) {
          // Image is wider than target - crop width
          sourceWidth = originalHeight * targetRatio
          sourceX = (originalWidth - sourceWidth) / 2
        } else {
          // Image is taller than target - crop height
          sourceHeight = originalWidth / targetRatio
          sourceY = (originalHeight - sourceHeight) / 2
        }
      }

      // Set canvas dimensions
      canvas.width = newWidth
      canvas.height = newHeight

      // Draw and resize image
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, newWidth, newHeight
      )

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create resized image'))
            return
          }

          // Create new file
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })

          resolve({
            resizedFile,
            originalDimensions: { width: originalWidth, height: originalHeight },
            newDimensions: { width: newWidth, height: newHeight },
            originalSize: file.size,
            newSize: resizedFile.size
          })
        },
        file.type,
        quality
      )

      // Clean up
      URL.revokeObjectURL(img.src)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

// Check if image needs resizing for gallery type
export function needsResizing(
  width: number,
  height: number,
  galleryType: keyof typeof GALLERY_DIMENSIONS
): boolean {
  const requirements = GALLERY_DIMENSIONS[galleryType]
  
  // Check if dimensions are too small
  if (width < requirements.minWidth || height < requirements.minHeight) {
    return false // Can't resize up, need larger source
  }

  // Check if aspect ratio is significantly off
  const expectedRatio = requirements.idealWidth / requirements.idealHeight
  const actualRatio = width / height
  const tolerance = 0.05 // 5%

  return Math.abs(actualRatio - expectedRatio) / expectedRatio > tolerance
}

// Get resize suggestions for gallery type
export function getResizeSuggestion(
  width: number,
  height: number,
  galleryType: keyof typeof GALLERY_DIMENSIONS
): ResizeOptions | null {
  const requirements = GALLERY_DIMENSIONS[galleryType]
  
  // Can't resize if source is too small
  if (width < requirements.minWidth || height < requirements.minHeight) {
    return null
  }

  return {
    targetWidth: requirements.idealWidth,
    targetHeight: requirements.idealHeight,
    quality: 0.9,
    maintainAspectRatio: true,
    cropMode: 'center'
  }
}
