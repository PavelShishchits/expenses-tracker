'use client'

import { useState } from 'react'
import { PREDEFINED_ICONS, PREDEFINED_COLORS, createCategorySchema, type CreateCategoryInput } from '@expenses-tracker/shared'
import { type PredefinedIcon } from '@/lib/icons'
import IconPicker from './IconPicker'
import ColorPicker from './ColorPicker'

type Props = {
  onSubmit: (input: CreateCategoryInput) => Promise<void>
  onCancel?: () => void
  submitError?: string | null
  isSubmitting?: boolean
}

export default function CategoryForm({ onSubmit, onCancel, submitError, isSubmitting }: Props) {
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState<PredefinedIcon>(PREDEFINED_ICONS[0])
  const [iconColor, setIconColor] = useState<string>(PREDEFINED_COLORS[0])
  const [titleError, setTitleError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTitleError(null)

    const result = createCategorySchema.safeParse({ title, icon, iconColor })
    if (!result.success) {
      const titleIssue = result.error.issues.find((i) => i.path[0] === 'title')
      setTitleError(titleIssue?.message ?? 'Invalid input')
      return
    }

    await onSubmit(result.data)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="category-title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="category-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          placeholder="e.g. Groceries"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {titleError && (
          <p role="alert" className="text-xs text-red-600">
            {titleError}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">Icon</p>
        <IconPicker value={icon} color={iconColor} onChange={setIcon} />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">Color</p>
        <ColorPicker value={iconColor} onChange={setIconColor} />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Adding…' : 'Add Category'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
