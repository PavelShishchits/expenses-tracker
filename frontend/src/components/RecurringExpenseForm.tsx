'use client'

import { useState } from 'react'
import { createRecurringSchema, type CreateRecurringInput } from '@expenses-tracker/shared'
import type { Category } from '@/services/category.service'

type Props = {
  categories: Category[]
  onSubmit: (input: CreateRecurringInput) => Promise<void>
  submitError?: string | null
  isSubmitting?: boolean
}

export default function RecurringExpenseForm({ categories, onSubmit, submitError, isSubmitting }: Props) {
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')
  const [errors, setErrors] = useState<{ categoryId?: string; amount?: string; label?: string }>({})

  const sorted = [
    ...categories.filter((c) => c.isSystem).sort((a, b) => a.title.localeCompare(b.title)),
    ...categories.filter((c) => !c.isSystem).sort((a, b) => a.title.localeCompare(b.title)),
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const parsed = Number(amount)
    const result = createRecurringSchema.safeParse({
      categoryId,
      amount: isNaN(parsed) ? amount : parsed,
      label,
    })

    if (!result.success) {
      const next: typeof errors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof typeof next
        if (!next[field]) next[field] = issue.message
      }
      setErrors(next)
      return
    }

    try {
      await onSubmit(result.data)
    } catch {
      // parent's onSubmit handles error state; swallow to avoid unhandled rejection
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="recurring-category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="recurring-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Select a category</option>
          {sorted.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p role="alert" className="text-xs text-red-600">
            {errors.categoryId}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="recurring-amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          id="recurring-amount"
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.amount && (
          <p role="alert" className="text-xs text-red-600">
            {errors.amount}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="recurring-label" className="block text-sm font-medium text-gray-700">
          Label
        </label>
        <input
          id="recurring-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={100}
          placeholder="e.g. Netflix subscription"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.label && (
          <p role="alert" className="text-xs text-red-600">
            {errors.label}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Adding…' : 'Add Recurring'}
      </button>
    </form>
  )
}
