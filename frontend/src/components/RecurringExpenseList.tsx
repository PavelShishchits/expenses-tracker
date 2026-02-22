import { Tag } from 'lucide-react'
import { ICON_MAP, type PredefinedIcon } from '@/lib/icons'
import type { RecurringExpense } from '@/services/recurring.service'

type Props = {
  items: RecurringExpense[]
  onDelete: (id: string) => void
}

export default function RecurringExpenseList({ items, onDelete }: Props) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No recurring expenses yet.</p>
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = item.category ? (ICON_MAP[item.category.icon as PredefinedIcon] ?? Tag) : Tag
        const iconColor = item.category?.iconColor ?? '#9ca3af'
        const activeFrom = new Date(item.activeFrom).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        })

        function handleDelete() {
          if (window.confirm('Delete this recurring expense?')) {
            onDelete(item.id)
          }
        }

        return (
          <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: iconColor }}
            >
              <Icon size={18} color="#fff" strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">{item.label}</p>
              {item.category ? (
                <p className="text-xs text-gray-500">{item.category.title}</p>
              ) : (
                <p className="text-xs text-amber-600">(category deleted)</p>
              )}
              <p className="text-xs text-gray-500">Since {activeFrom}</p>
            </div>

            <span className="shrink-0 text-sm font-semibold text-gray-900">
              ${item.amount.toFixed(2)}
            </span>

            {item.deletedAt !== null ? (
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                Inactive
              </span>
            ) : (
              <button
                type="button"
                onClick={handleDelete}
                className="shrink-0 rounded px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
