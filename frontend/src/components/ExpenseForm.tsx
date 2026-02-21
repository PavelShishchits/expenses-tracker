'use client'

import { useState, type FormEvent } from 'react'
import { createExpenseSchema } from '@expenses-tracker/shared'

type FieldErrors = {
  amount?: string
  date?: string
}

type Props = {
  onSubmit: (data: { amount: number; date: string }) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function ExpenseForm({ onSubmit, onCancel, isSubmitting = false }: Props) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const rawAmount = formData.get('amount') as string
    const date = formData.get('date') as string

    const partialResult = createExpenseSchema.omit({ categoryId: true }).safeParse({
      amount: rawAmount === '' ? undefined : Number(rawAmount),
      date,
    })

    if (!partialResult.success) {
      const errors: FieldErrors = {}
      for (const issue of partialResult.error.issues) {
        const field = issue.path[0] as keyof FieldErrors
        if (!errors[field]) errors[field] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    await onSubmit(partialResult.data)
  }

  const today = todayString()

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4 rounded-xl border bg-white p-4">
      <div>
        <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.amount && <p className="mt-1 text-xs text-red-500">{fieldErrors.amount}</p>}
      </div>

      <div>
        <label htmlFor="date" className="mb-1 block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={today}
          max={today}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {fieldErrors.date && <p className="mt-1 text-xs text-red-500">{fieldErrors.date}</p>}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
