import { z } from 'zod'

export const PREDEFINED_ICONS = [
  'shopping-cart',
  'utensils',
  'car',
  'home',
  'heart',
  'film',
  'book',
  'briefcase',
  'coffee',
  'gift',
  'music',
  'plane',
  'dumbbell',
  'wifi',
  'phone',
  'zap',
  'star',
  'tag',
] as const

export const PREDEFINED_COLORS = [
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#6B7280',
  '#78716C',
] as const

export const createCategorySchema = z.object({
  title: z.string().min(1).max(50),
  icon: z.enum(PREDEFINED_ICONS),
  iconColor: z.enum(PREDEFINED_COLORS),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
