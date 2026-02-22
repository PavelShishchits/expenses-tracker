'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from 'recharts'
import type { MonthReportData } from '@/services/report.service'
import { ICON_MAP, type PredefinedIcon } from '@/lib/icons'

type Props = { data: MonthReportData }

const Y_AXIS_WIDTH = 124

function YAxisTick({
  x,
  y,
  payload,
  categoryData,
}: {
  x?: number | string
  y?: number | string
  payload?: { value: string }
  categoryData: MonthReportData['data']
}) {
  if (!payload || x === undefined || y === undefined) return null

  const xNum = typeof x === 'string' ? parseFloat(x) : x
  const yNum = typeof y === 'string' ? parseFloat(y) : y

  const entry = categoryData.find((c) => c.categoryTitle === payload.value)
  const Icon = entry ? (ICON_MAP[entry.icon as PredefinedIcon] ?? null) : null
  const color = entry?.iconColor ?? '#888888'

  return (
    <foreignObject x={xNum - Y_AXIS_WIDTH} y={yNum - 12} width={Y_AXIS_WIDTH - 4} height={24}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          justifyContent: 'flex-end',
          height: '100%',
        }}
      >
        {Icon && <Icon size={14} style={{ color, flexShrink: 0 }} strokeWidth={1.8} />}
        <span
          style={{
            fontSize: 13,
            color: '#374151',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {payload.value}
        </span>
      </div>
    </foreignObject>
  )
}

export default function MonthReport({ data }: Props) {
  if (data.data.length === 0) {
    return <p className="text-center text-sm text-gray-500">No expenses recorded for this period.</p>
  }

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={data.data.length * 48 + 40}>
        <BarChart layout="vertical" data={data.data}>
          <YAxis
            type="category"
            dataKey="categoryTitle"
            width={Y_AXIS_WIDTH}
            tick={(props: { x?: number | string; y?: number | string; payload?: { value: string } }) => (
              <YAxisTick {...props} categoryData={data.data} />
            )}
          />
          <XAxis type="number" tickFormatter={(v: number) => `$${v}`} />
          <Tooltip formatter={(v: number | undefined) => `$${Number(v ?? 0).toFixed(2)}`} />
          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
            {data.data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.iconColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-right text-sm font-semibold text-gray-700">Total: ${data.total.toFixed(2)}</p>
    </div>
  )
}
