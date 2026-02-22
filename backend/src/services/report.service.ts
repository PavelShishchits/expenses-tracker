import { prisma } from '../lib/prisma.js'

export type CategoryTotal = {
  categoryId: string
  categoryTitle: string
  icon: string
  iconColor: string
  total: number
}

export type MonthReport = {
  period: { type: 'month'; year: number; month: number }
  data: CategoryTotal[]
  total: number
}

export type MonthTotal = {
  month: number
  label: string
  total: number
}

export type YearReport = {
  period: { type: 'year'; year: number }
  data: MonthTotal[]
  total: number
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export async function getMonth(accountId: string, year: number, month: number): Promise<MonthReport> {
  const monthStart = new Date(Date.UTC(year, month - 1, 1))
  const monthEnd = new Date(Date.UTC(year, month, 1))

  const grouped = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: { accountId, date: { gte: monthStart, lt: monthEnd } },
    _sum: { amount: true },
  })

  const categoryIds = grouped.map(g => g.categoryId)

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, title: true, icon: true, iconColor: true },
  })

  const categoryMap = new Map(categories.map(c => [c.id, c]))

  const data: CategoryTotal[] = grouped
    .map(g => {
      const cat = categoryMap.get(g.categoryId)
      const total = g._sum.amount?.toNumber() ?? 0
      return {
        categoryId: g.categoryId,
        categoryTitle: cat?.title ?? '',
        icon: cat?.icon ?? '',
        iconColor: cat?.iconColor ?? '',
        total,
      }
    })
    .sort((a, b) => b.total - a.total)

  const total = data.reduce((sum, c) => sum + c.total, 0)

  return { period: { type: 'month', year, month }, data, total }
}

export async function getYear(accountId: string, year: number): Promise<YearReport> {
  const yearStart = new Date(Date.UTC(year, 0, 1))
  const yearEnd = new Date(Date.UTC(year + 1, 0, 1))

  const expenses = await prisma.expense.findMany({
    where: { accountId, date: { gte: yearStart, lt: yearEnd } },
    select: { date: true, amount: true },
  })

  const data: MonthTotal[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: MONTH_LABELS[i] as string,
    total: 0,
  }))

  for (const expense of expenses) {
    const idx = expense.date.getUTCMonth()
    data[idx]!.total += expense.amount.toNumber()
  }

  const total = data.reduce((sum, m) => sum + m.total, 0)

  return { period: { type: 'year', year }, data, total }
}
