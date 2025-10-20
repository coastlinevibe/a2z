import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
