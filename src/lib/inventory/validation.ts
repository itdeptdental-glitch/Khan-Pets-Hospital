import { z } from 'zod'
import { categories } from './types'
export const inventoryInput = z.object({
  name: z.string().trim().min(1, 'Item name is required').max(191),
  category: z.enum(categories),
  brand: z.string().trim().max(191).nullable().optional(),
  quantity: z.number().int().min(0).max(2147483647),
  unit: z.string().trim().min(1).max(30),
  price: z.number().min(0).max(99999999.99).nullable(),
  reorderLevel: z.number().int().min(0).max(2147483647),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
    const date = new Date(value + 'T00:00:00Z')
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value
  }, 'Enter a valid expiry date').nullable(),
  description: z.string().trim().max(2000).nullable().optional(),
})
