import { type CreateExpenseInput } from '@expenses-tracker/shared'
import { prisma } from '../lib/prisma.js'
import { makeHttpError } from '../lib/errors.js'

const createdBySelect = {
  select: {
    id: true,
    email: true,
    accountId: true,
    createdAt: true,
    updatedAt: true,
  },
} as const

export async function create(accountId: string, userId: string, input: CreateExpenseInput) {
  const date = new Date(input.date + 'T00:00:00.000Z')

  const today = new Date()
  today.setUTCHours(23, 59, 59, 999)
  if (date > today) throw makeHttpError('Date cannot be in the future', 422)

  return prisma.expense.create({
    data: {
      accountId,
      createdById: userId,
      categoryId: input.categoryId,
      amount: input.amount,
      date,
    },
    include: {
      category: true,
      createdBy: createdBySelect,
    },
  })
}

export async function list(accountId: string, from?: string, to?: string) {
  return prisma.expense.findMany({
    where: {
      accountId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from + 'T00:00:00.000Z') } : {}),
              ...(to ? { lte: new Date(to + 'T00:00:00.000Z') } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    include: {
      category: true,
      createdBy: createdBySelect,
    },
  })
}
