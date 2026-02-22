'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

export type Period = { type: 'month'; year: number; month: number } | { type: 'year'; year: number }

type Props = { value: Period; onChange: (period: Period) => void }

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function isAtCurrentMonth(period: Period): boolean {
  const now = new Date()
  if (period.type === 'month') {
    return period.year === now.getFullYear() && period.month === now.getMonth() + 1
  }
  return period.year === now.getFullYear()
}

function prevPeriod(period: Period): Period {
  if (period.type === 'year') return { type: 'year', year: period.year - 1 }
  if (period.month === 1) return { type: 'month', year: period.year - 1, month: 12 }
  return { type: 'month', year: period.year, month: period.month - 1 }
}

function nextPeriod(period: Period): Period {
  if (period.type === 'year') return { type: 'year', year: period.year + 1 }
  if (period.month === 12) return { type: 'month', year: period.year + 1, month: 1 }
  return { type: 'month', year: period.year, month: period.month + 1 }
}

function periodLabel(period: Period): string {
  if (period.type === 'year') return String(period.year)
  return `${MONTH_NAMES[period.month - 1]} ${period.year}`
}

export default function PeriodSelector({ value, onChange }: Props) {
  const atCurrent = isAtCurrentMonth(value)

  function switchToMonth() {
    if (value.type === 'month') return
    const now = new Date()
    onChange({ type: 'month', year: value.year, month: now.getMonth() + 1 })
  }

  function switchToYear() {
    if (value.type === 'year') return
    onChange({ type: 'year', year: value.year })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex rounded-lg border bg-white overflow-hidden">
        <button
          type="button"
          onClick={switchToMonth}
          className={[
            'px-4 py-2 text-sm font-medium transition-colors',
            value.type === 'month' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50',
          ].join(' ')}
        >
          Month
        </button>
        <button
          type="button"
          onClick={switchToYear}
          className={[
            'px-4 py-2 text-sm font-medium transition-colors',
            value.type === 'year' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50',
          ].join(' ')}
        >
          Year
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Previous period"
          onClick={() => onChange(prevPeriod(value))}
          className="rounded-full p-1 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="w-40 text-center text-sm font-semibold text-gray-800">
          {periodLabel(value)}
        </span>

        <button
          type="button"
          aria-label="Next period"
          onClick={() => onChange(nextPeriod(value))}
          disabled={atCurrent}
          className="rounded-full p-1 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
