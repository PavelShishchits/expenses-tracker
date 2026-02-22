'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import type { YearReportData } from '@/services/report.service'

type Props = { data: YearReportData }

export default function YearReport({ data }: Props) {
  if (data.total === 0) {
    return <p className="text-center text-sm text-gray-500">No expenses recorded for this year.</p>
  }

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data.data}>
          <XAxis dataKey="label" />
          <YAxis tickFormatter={(v: number) => `$${v}`} />
          <Tooltip formatter={(v: number | undefined) => `$${Number(v ?? 0).toFixed(2)}`} />
          <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-right text-sm font-semibold text-gray-700">
        Total: ${data.total.toFixed(2)}
      </p>
    </div>
  )
}
