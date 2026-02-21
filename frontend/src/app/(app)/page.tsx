'use client'

import { useState, useEffect } from 'react'
import CategoryGrid from '@/components/CategoryGrid'
import ExpenseForm from '@/components/ExpenseForm'
import { list as listCategories, type Category } from '@/services/category.service'
import { create as createExpense } from '@/services/expense.service'

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((err) => setCategoriesError(err instanceof Error ? err.message : 'Failed to load categories'))
      .finally(() => setIsLoadingCategories(false))
  }, [])

  async function handleExpenseSubmit(data: { amount: number; date: string }) {
    if (!selectedCategory) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await createExpense({ ...data, categoryId: selectedCategory.id })
      setSelectedCategory(null)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Log Expense</h1>

      {isLoadingCategories && <p className="text-gray-500">Loading…</p>}

      {categoriesError && <p className="text-sm text-red-500">{categoriesError}</p>}

      {!isLoadingCategories && !categoriesError && categories.length === 0 && (
        <p className="text-gray-500">Create a category first.</p>
      )}

      {!isLoadingCategories && !categoriesError && categories.length > 0 && (
        <>
          <CategoryGrid
            categories={categories}
            selectedId={selectedCategory?.id ?? null}
            onSelect={(cat) => setSelectedCategory(cat.id === selectedCategory?.id ? null : cat)}
          />

          {selectedCategory && (
            <ExpenseForm
              onSubmit={handleExpenseSubmit}
              onCancel={() => setSelectedCategory(null)}
              isSubmitting={isSubmitting}
            />
          )}

          {submitError && <p className="mt-3 text-sm text-red-500">{submitError}</p>}
        </>
      )}
    </div>
  )
}
