'use client'

import { useEffect, useState } from 'react'
import PeriodSelector, { type Period } from '@/components/PeriodSelector'
import MonthReport from '@/components/MonthReport'
import YearReport from '@/components/YearReport'
import { getMonth, getYear, type MonthReportData, type YearReportData } from '@/services/report.service'
import LoadingSkeleton from '@/components/LoadingSkeleton'

type Report = MonthReportData | YearReportData

function isMonthReport(r: Report): r is MonthReportData {
  return r.period.type === 'month'
}

function currentPeriod(): Period {
  const now = new Date()
  return { type: 'month', year: now.getFullYear(), month: now.getMonth() + 1 }
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>(currentPeriod)
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const fetch = period.type === 'month'
      ? getMonth(period.year, period.month)
      : getYear(period.year)

    fetch
      .then((data) => {
        if (!cancelled) setReport(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load report')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [period])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <PeriodSelector value={period} onChange={setPeriod} />

      {isLoading ? (
        <LoadingSkeleton variant="chart" />
      ) : error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : report === null ? null : isMonthReport(report) ? (
        <MonthReport data={report} />
      ) : (
        <YearReport data={report} />
      )}
    </div>
  )
}
