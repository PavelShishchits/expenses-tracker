'use client'

import { useEffect, useState } from 'react'
import { Tag } from 'lucide-react'
import { type CreateCategoryInput } from '@expenses-tracker/shared'
import { list, create, remove, type Category } from '@/services/category.service'
import { ICON_MAP } from '@/lib/icons'
import CategoryForm from '@/components/CategoryForm'

function CategoryRow({
  category,
  onDelete,
}: {
  category: Category
  onDelete: (id: string) => void
}) {
  const Icon = ICON_MAP[category.icon as keyof typeof ICON_MAP] ?? Tag

  function handleDelete() {
    if (window.confirm(`Delete "${category.title}"?`)) {
      onDelete(category.id)
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-sm">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: category.iconColor }}
      >
        <Icon size={18} color="#fff" strokeWidth={1.8} />
      </div>
      <span className="flex-1 text-sm font-medium text-gray-800">{category.title}</span>
      {!category.isSystem && (
        <button
          type="button"
          onClick={handleDelete}
          className="rounded px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          Delete
        </button>
      )}
    </div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formKey, setFormKey] = useState(0)

  async function fetchCategories() {
    try {
      setFetchError(null)
      const data = await list()
      setCategories(data)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  async function handleCreate(input: CreateCategoryInput) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await create(input)
      await fetchCategories()
      setFormKey((k) => k + 1)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null)
    try {
      await remove(id)
      await fetchCategories()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete category')
    }
  }

  const systemCategories = categories.filter((c) => c.isSystem)
  const customCategories = categories.filter((c) => !c.isSystem)
  const sorted = [...systemCategories, ...customCategories]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

      {deleteError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {deleteError}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : fetchError ? (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {fetchError}
        </p>
      ) : sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">No categories yet</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((category) => (
            <CategoryRow key={category.id} category={category} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Add Category</h2>
        <CategoryForm
          key={formKey}
          onSubmit={handleCreate}
          submitError={submitError}
          isSubmitting={isSubmitting}
        />
      </section>
    </div>
  )
}
