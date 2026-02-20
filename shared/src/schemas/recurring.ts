import { z } from 'zod'

export const createRecurringSchema = z.object({
  amount: z.number().positive(),
  label: z.string().min(1).max(100),
  categoryId: z.string().min(1),
})

export const updateRecurringSchema = createRecurringSchema.partial()

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>
