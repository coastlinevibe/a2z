import { z } from 'zod'

// Media item schema for gallery with descriptions
export const mediaItemSchema = z.object({
  url: z.string().url(),
  description: z.string().max(100, 'Description must be less than 100 characters').optional(),
})

// Post creation schema
export const createPostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(80, 'Title must be less than 80 characters'),
  price_cents: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('ZAR'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(600, 'Description must be less than 600 characters'),
  emoji_tags: z.array(z.string()).min(1, 'At least 1 emoji tag is required').max(4, 'Maximum 4 emoji tags allowed'),
  media_urls: z.array(z.string().url()).min(1, 'At least one image is required').max(8, 'Maximum 8 images allowed'),
  media_items: z.array(mediaItemSchema).max(8, 'Maximum 8 images allowed').optional(),
  whatsapp_number: z.string()
    .min(1, 'Contact number is required')
    .transform((val) => {
      if (!val) return val
      // Remove all non-digit characters
      const cleaned = val.replace(/\D/g, '')
      // If starts with 0, replace with +27 (South Africa)
      if (cleaned.startsWith('0')) {
        return '+27' + cleaned.substring(1)
      }
      // If starts with 27, add +
      if (cleaned.startsWith('27')) {
        return '+' + cleaned
      }
      // If already has +, return as is
      if (val.startsWith('+')) {
        return val
      }
      // Otherwise assume SA number and add +27
      return '+27' + cleaned
    })
    .refine((val) => /^\+27\d{9}$/.test(val), {
      message: 'Invalid SA phone number (use format: 0712345678 or +27712345678)'
    }),
  location: z.string().min(3, 'Location is required (minimum 3 characters)'),
  display_type: z.enum(['hover', 'slider', 'vertical', 'premium']).default('hover'),
})

// Post update schema
export const updatePostSchema = createPostSchema.partial().extend({
  is_active: z.boolean().optional(),
})

// Analytics action schema
export const analyticsActionSchema = z.object({
  action: z.enum(['view', 'click']),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type AnalyticsAction = z.infer<typeof analyticsActionSchema>
