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

  const [grouped, activeRecurring] = await Promise.all([
    prisma.expense.groupBy({
      by: ['categoryId'],
      where: { accountId, date: { gte: monthStart, lt: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.recurringExpense.findMany({
      where: {
        accountId,
        activeFrom: { lte: monthStart },
        OR: [{ deletedAt: null }, { deletedAt: { gt: monthStart } }],
      },
      select: {
        categoryId: true,
        amount: true,
        category: { select: { id: true, title: true, icon: true, iconColor: true } },
      },
    }),
  ])

  const categoryIds = grouped.map(g => g.categoryId)

  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, title: true, icon: true, iconColor: true },
  })

  const categoryMap = new Map(categories.map(c => [c.id, c]))

  // Seed categoryMap with recurring categories not already present
  for (const r of activeRecurring) {
    if (!categoryMap.has(r.categoryId)) {
      categoryMap.set(r.categoryId, r.category)
    }
  }

  // Build totals map from groupBy results
  const totalsMap = new Map<string, number>(
    grouped.map(g => [g.categoryId, g._sum.amount?.toNumber() ?? 0]),
  )

  // Merge recurring amounts into totals map
  for (const r of activeRecurring) {
    const existing = totalsMap.get(r.categoryId) ?? 0
    totalsMap.set(r.categoryId, existing + r.amount.toNumber())
  }

  const data: CategoryTotal[] = Array.from(totalsMap.entries())
    .map(([categoryId, total]) => {
      const cat = categoryMap.get(categoryId)
      return {
        categoryId,
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

  const [expenses, allRecurring] = await Promise.all([
    prisma.expense.findMany({
      where: { accountId, date: { gte: yearStart, lt: yearEnd } },
      select: { amount: true, date: true },
    }),
    prisma.recurringExpense.findMany({
      where: {
        accountId,
        activeFrom: { lt: yearEnd },
        OR: [{ deletedAt: null }, { deletedAt: { gt: yearStart } }],
      },
      select: { amount: true, activeFrom: true, deletedAt: true },
    }),
  ])

  const monthTotals = new Array<number>(12).fill(0)

  for (const exp of expenses) {
    const m = exp.date.getUTCMonth() // 0-indexed
    monthTotals[m] = (monthTotals[m] ?? 0) + exp.amount.toNumber()
  }

  for (let m = 0; m < 12; m++) {
    const monthStart = new Date(Date.UTC(year, m, 1))
    for (const r of allRecurring) {
      if (r.activeFrom <= monthStart && (r.deletedAt === null || r.deletedAt > monthStart)) {
        monthTotals[m] = (monthTotals[m] ?? 0) + r.amount.toNumber()
      }
    }
  }

  const data: MonthTotal[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: MONTH_LABELS[i] as string,
    total: monthTotals[i] ?? 0,
  }))

  const total = data.reduce((sum, m) => sum + m.total, 0)

  return { period: { type: 'year', year }, data, total }
}
