import { prisma } from '../lib/prisma.js'

export async function list(accountId: string) {
  return prisma.category.findMany({
    where: {
      OR: [{ isSystem: true }, { accountId }],
    },
    orderBy: { title: 'asc' },
    select: {
      id: true,
      title: true,
      icon: true,
      iconColor: true,
      isSystem: true,
      accountId: true,
      createdAt: true,
    },
  })
}
