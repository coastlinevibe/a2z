/**
 * Watermark Generator for A2Z Platform
 * Adds watermarks to images for free tier users
 */

export interface WatermarkOptions {
  text?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'diagonal'
  opacity?: number
  fontSize?: number
  color?: string
  padding?: number
}

const DEFAULT_OPTIONS: WatermarkOptions = {
  text: 'A2Z.co.za',
  position: 'bottom-right',
  opacity: 0.5,
  fontSize: 24,
  color: '#ffffff',
  padding: 20
}

/**
 * Add watermark to an image file
 */
export async function addWatermark(
  imageFile: File,
  options: WatermarkOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          throw new Error('Could not get canvas context')
        }

        // Set canvas size to image size
        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Apply watermark
        applyWatermark(ctx, canvas.width, canvas.height, opts)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          imageFile.type || 'image/jpeg',
          0.95 // Quality
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(imageFile)
  })
}

/**
 * Apply watermark to canvas context
 */
function applyWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: Required<WatermarkOptions>
) {
  const { text, position, opacity, fontSize, color, padding } = options

  ctx.save()

  // Set text properties
  ctx.font = `bold ${fontSize}px Arial, sans-serif`
  ctx.fillStyle = color
  ctx.globalAlpha = opacity
  ctx.textBaseline = 'bottom'

  // Add shadow for better visibility
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  const textMetrics = ctx.measureText(text)
  const textWidth = textMetrics.width
  const textHeight = fontSize

  // Calculate position
  let x = 0
  let y = 0

  switch (position) {
    case 'bottom-right':
      x = width - textWidth - padding
      y = height - padding
      break
    case 'bottom-left':
      x = padding
      y = height - padding
      break
    case 'top-right':
      x = width - textWidth - padding
      y = textHeight + padding
      break
    case 'top-left':
      x = padding
      y = textHeight + padding
      break
    case 'center':
      x = (width - textWidth) / 2
      y = (height + textHeight) / 2
      break
    case 'diagonal':
      // Diagonal watermark across the image
      ctx.translate(width / 2, height / 2)
      ctx.rotate(-Math.PI / 4) // -45 degrees
      x = -textWidth / 2
      y = textHeight / 2
      break
  }

  // Draw watermark text
  ctx.fillText(text, x, y)

  ctx.restore()
}

/**
 * Add watermark with logo (if available)
 */
export async function addWatermarkWithLogo(
  imageFile: File,
  logoUrl: string,
  options: WatermarkOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const logo = new Image()
    const reader = new FileReader()

    let imageLoaded = false
    let logoLoaded = false

    const checkBothLoaded = () => {
      if (imageLoaded && logoLoaded) {
        processImage()
      }
    }

    const processImage = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          throw new Error('Could not get canvas context')
        }

        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Draw logo watermark
        const logoSize = Math.min(img.width, img.height) * 0.15 // 15% of smallest dimension
        const padding = opts.padding || 20

        let logoX = 0
        let logoY = 0

        switch (opts.position) {
          case 'bottom-right':
            logoX = img.width - logoSize - padding
            logoY = img.height - logoSize - padding
            break
          case 'bottom-left':
            logoX = padding
            logoY = img.height - logoSize - padding
            break
          case 'top-right':
            logoX = img.width - logoSize - padding
            logoY = padding
            break
          case 'top-left':
            logoX = padding
            logoY = padding
            break
          case 'center':
            logoX = (img.width - logoSize) / 2
            logoY = (img.height - logoSize) / 2
            break
        }

        ctx.globalAlpha = opts.opacity || 0.5
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          imageFile.type || 'image/jpeg',
          0.95
        )
      } catch (error) {
        reject(error)
      }
    }

    reader.onload = (e) => {
      img.src = e.target?.result as string
    }

    img.onload = () => {
      imageLoaded = true
      checkBothLoaded()
    }

    logo.onload = () => {
      logoLoaded = true
      checkBothLoaded()
    }

    logo.onerror = () => {
      // If logo fails, fall back to text watermark
      addWatermark(imageFile, options).then(resolve).catch(reject)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    logo.src = logoUrl
    reader.readAsDataURL(imageFile)
  })
}

/**
 * Check if user should get watermarked images
 */
export function shouldApplyWatermark(subscriptionTier: string | null): boolean {
  return subscriptionTier === 'free' || subscriptionTier === null
}

/**
 * Batch process multiple images with watermarks
 */
export async function batchAddWatermarks(
  files: File[],
  options: WatermarkOptions = {}
): Promise<Blob[]> {
  const promises = files.map(file => addWatermark(file, options))
  return Promise.all(promises)
}
