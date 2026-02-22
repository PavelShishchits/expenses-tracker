import type { CreateCategoryInput } from '@expenses-tracker/shared'
import { makeHttpError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'

const categorySelect = {
  id: true,
  title: true,
  icon: true,
  iconColor: true,
  isSystem: true,
  accountId: true,
  createdAt: true,
} as const

export async function list(accountId: string) {
  return prisma.category.findMany({
    where: {
      OR: [{ isSystem: true }, { accountId }],
    },
    orderBy: { title: 'asc' },
    select: categorySelect,
  })
}

export async function create(accountId: string, input: CreateCategoryInput) {
  const duplicate = await prisma.category.findFirst({
    where: {
      OR: [{ isSystem: true }, { accountId }],
      title: { equals: input.title, mode: 'insensitive' },
    },
    select: { id: true },
  })

  if (duplicate) {
    throw makeHttpError('Category title already in use', 409)
  }

  return prisma.category.create({
    data: {
      title: input.title,
      icon: input.icon,
      iconColor: input.iconColor,
      accountId,
    },
    select: categorySelect,
  })
}

export async function remove(accountId: string, categoryId: string): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: {
      id: true,
      isSystem: true,
      accountId: true,
      _count: { select: { expenses: true, recurringExpenses: true } },
    },
  })

  if (!category) throw makeHttpError('Not found', 404)
  if (category.isSystem) throw makeHttpError('Cannot delete system category', 403)
  if (category.accountId !== accountId) throw makeHttpError('Forbidden', 403)

  if (category._count.expenses > 0 || category._count.recurringExpenses > 0) {
    throw makeHttpError('Category has associated expenses and cannot be deleted', 409)
  }

  await prisma.category.delete({ where: { id: categoryId } })
}
