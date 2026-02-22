'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts'
import type { MonthReportData } from '@/services/report.service'

type Props = { data: MonthReportData }

export default function MonthReport({ data }: Props) {
  if (data.data.length === 0) {
    return <p className="text-center text-sm text-gray-500">No expenses recorded for this period.</p>
  }

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={data.data.length * 48 + 40}>
        <BarChart layout="vertical" data={data.data}>
          <YAxis type="category" dataKey="categoryTitle" width={100} tick={{ fontSize: 13 }} />
          <XAxis type="number" tickFormatter={(v: number) => `$${v}`} />
          <Tooltip formatter={(v: number | undefined) => `$${Number(v ?? 0).toFixed(2)}`} />
          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
            {data.data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.iconColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-right text-sm font-semibold text-gray-700">
        Total: ${data.total.toFixed(2)}
      </p>
    </div>
  )
}
