import { z } from 'zod'

export const createExpenseSchema = z.object({
  amount: z
    .number()
    .positive()
    .refine(
      (v) => {
        const decimals = (v.toString().split('.')[1] ?? '').length
        return decimals <= 2
      },
      { message: 'Amount must have at most 2 decimal places' },
    ),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Must be YYYY-MM-DD format' }),
  categoryId: z.string().min(1),
})

export const updateExpenseSchema = createExpenseSchema.partial()

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
