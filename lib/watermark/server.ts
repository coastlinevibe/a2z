/**
 * Server-side watermark processing using Sharp
 * For use in API routes and server components
 */

import sharp from 'sharp'
import { Buffer } from 'buffer'

export interface ServerWatermarkOptions {
  text?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  opacity?: number
  fontSize?: number
  padding?: number
}

const DEFAULT_OPTIONS: ServerWatermarkOptions = {
  text: 'A2Z.co.za',
  position: 'bottom-right',
  opacity: 0.5,
  fontSize: 48,
  padding: 40
}

/**
 * Add watermark to image buffer using Sharp
 */
export async function addWatermarkServer(
  imageBuffer: Buffer,
  options: ServerWatermarkOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata()
    const { width = 1000, height = 1000 } = metadata

    // Create SVG watermark
    const watermarkSvg = createWatermarkSVG(
      opts.text!,
      width,
      height,
      opts.position!,
      opts.opacity!,
      opts.fontSize!,
      opts.padding!
    )

    // Composite watermark onto image
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          gravity: getGravity(opts.position!)
        }
      ])
      .toBuffer()

    return result
  } catch (error) {
    console.error('Watermark error:', error)
    // Return original image if watermarking fails
    return imageBuffer
  }
}

/**
 * Create SVG watermark
 */
function createWatermarkSVG(
  text: string,
  imageWidth: number,
  imageHeight: number,
  position: string,
  opacity: number,
  fontSize: number,
  padding: number
): string {
  // Calculate text dimensions (approximate)
  const textWidth = text.length * fontSize * 0.6
  const textHeight = fontSize

  let x = padding
  let y = padding + textHeight

  switch (position) {
    case 'bottom-right':
      x = imageWidth - textWidth - padding
      y = imageHeight - padding
      break
    case 'bottom-left':
      x = padding
      y = imageHeight - padding
      break
    case 'top-right':
      x = imageWidth - textWidth - padding
      y = padding + textHeight
      break
    case 'top-left':
      x = padding
      y = padding + textHeight
      break
    case 'center':
      x = (imageWidth - textWidth) / 2
      y = (imageHeight + textHeight) / 2
      break
  }

  return `
    <svg width="${imageWidth}" height="${imageHeight}">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
          <feOffset dx="2" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <text
        x="${x}"
        y="${y}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="white"
        fill-opacity="${opacity}"
        filter="url(#shadow)"
      >${text}</text>
    </svg>
  `
}

/**
 * Get Sharp gravity from position
 */
function getGravity(position: string): string {
  const gravityMap: Record<string, string> = {
    'bottom-right': 'southeast',
    'bottom-left': 'southwest',
    'top-right': 'northeast',
    'top-left': 'northwest',
    'center': 'center'
  }
  return gravityMap[position] || 'southeast'
}

/**
 * Add watermark to multiple images
 */
export async function batchAddWatermarksServer(
  imageBuffers: Buffer[],
  options: ServerWatermarkOptions = {}
): Promise<Buffer[]> {
  const promises = imageBuffers.map(buffer => addWatermarkServer(buffer, options))
  return Promise.all(promises)
}

/**
 * Remove watermark metadata (for premium users upgrading)
 * Note: This doesn't actually remove the visual watermark,
 * it just marks the image as needing re-upload
 */
export async function markForWatermarkRemoval(
  imageUrl: string,
  userId: string
): Promise<boolean> {
  // This would update a database flag indicating the image needs re-upload
  // The actual watermark removal would require the original image
  return true
}

/**
 * Check if image has watermark metadata
 */
export async function hasWatermark(imageBuffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(imageBuffer).metadata()
    // Check for watermark metadata in EXIF or custom fields
    return metadata.exif?.toString().includes('A2Z.co.za') || false
  } catch {
    return false
  }
}

/**
 * Optimize image and add watermark in one pass
 */
export async function optimizeAndWatermark(
  imageBuffer: Buffer,
  options: ServerWatermarkOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  try {
    const metadata = await sharp(imageBuffer).metadata()
    const { width = 1000, height = 1000 } = metadata

    // Create watermark SVG
    const watermarkSvg = createWatermarkSVG(
      opts.text!,
      width,
      height,
      opts.position!,
      opts.opacity!,
      opts.fontSize!,
      opts.padding!
    )

    // Optimize and watermark in one pass
    const result = await sharp(imageBuffer)
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          gravity: getGravity(opts.position!)
        }
      ])
      .jpeg({ quality: 85, progressive: true })
      .toBuffer()

    return result
  } catch (error) {
    console.error('Optimize and watermark error:', error)
    return imageBuffer
  }
}
