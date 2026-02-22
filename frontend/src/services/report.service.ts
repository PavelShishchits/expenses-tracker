import { apiFetch } from './api'

export type CategoryTotal = {
  categoryId: string
  categoryTitle: string
  icon: string
  iconColor: string
  total: number
}

export type MonthTotal = {
  month: number
  label: string
  total: number
}

export type MonthReportData = {
  period: { type: 'month'; year: number; month: number }
  data: CategoryTotal[]
  total: number
}

export type YearReportData = {
  period: { type: 'year'; year: number }
  data: MonthTotal[]
  total: number
}

export async function getMonth(year: number, month: number): Promise<MonthReportData> {
  const res = await apiFetch(`/reports/month?year=${year}&month=${month}`)
  const body = await res.json()
  if (!res.ok) throw new Error((body as { error?: string }).error ?? 'Request failed')
  return body as MonthReportData
}

export async function getYear(year: number): Promise<YearReportData> {
  const res = await apiFetch(`/reports/year?year=${year}`)
  const body = await res.json()
  if (!res.ok) throw new Error((body as { error?: string }).error ?? 'Request failed')
  return body as YearReportData
}
