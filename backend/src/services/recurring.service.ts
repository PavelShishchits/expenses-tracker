import type { CreateRecurringInput } from '@expenses-tracker/shared'
import { makeHttpError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'

const recurringSelect = {
  id: true,
  amount: true,
  label: true,
  accountId: true,
  activeFrom: true,
  deletedAt: true,
  createdAt: true,
  category: { select: { id: true, title: true, icon: true, iconColor: true } },
} as const

function firstDayOfCurrentMonthUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

export async function list(accountId: string) {
  return prisma.recurringExpense.findMany({
    where: { accountId },
    orderBy: { createdAt: 'desc' },
    select: recurringSelect,
  })
}

export async function create(accountId: string, userId: string, input: CreateRecurringInput) {
  const category = await prisma.category.findFirst({
    where: {
      id: input.categoryId,
      OR: [{ isSystem: true }, { accountId }],
    },
    select: { id: true },
  })

  if (!category) throw makeHttpError('Category not found', 404)

  return prisma.recurringExpense.create({
    data: {
      amount: input.amount,
      label: input.label,
      accountId,
      createdById: userId,
      categoryId: input.categoryId,
      activeFrom: firstDayOfCurrentMonthUTC(),
    },
    select: recurringSelect,
  })
}

export async function softDelete(accountId: string, id: string): Promise<void> {
  const record = await prisma.recurringExpense.findUnique({
    where: { id },
    select: { id: true, accountId: true, deletedAt: true },
  })

  if (!record) throw makeHttpError('Not found', 404)
  if (record.accountId !== accountId) throw makeHttpError('Forbidden', 403)
  if (record.deletedAt !== null) throw makeHttpError('Not found', 404)

  await prisma.recurringExpense.update({
    where: { id },
    data: { deletedAt: firstDayOfCurrentMonthUTC() },
  })
}
