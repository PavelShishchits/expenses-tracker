'use client'

import { useEffect, useState } from 'react'
import { type CreateRecurringInput } from '@expenses-tracker/shared'
import { list as listCategories, type Category } from '@/services/category.service'
import { list as listRecurring, create, remove, type RecurringExpense } from '@/services/recurring.service'
import RecurringExpenseForm from '@/components/RecurringExpenseForm'
import RecurringExpenseList from '@/components/RecurringExpenseList'

export default function RecurringPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<RecurringExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formKey, setFormKey] = useState(0)

  async function fetchData() {
    try {
      setFetchError(null)
      const [cats, recurring] = await Promise.all([listCategories(), listRecurring()])
      setCategories(cats)
      setItems(recurring)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchRecurring() {
    try {
      const recurring = await listRecurring()
      setItems(recurring)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load recurring expenses')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleCreate(input: CreateRecurringInput) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await create(input)
      await fetchRecurring()
      setFormKey((k) => k + 1)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create recurring expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteError(null)
    try {
      await remove(id)
      await fetchRecurring()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete recurring expense')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Recurring Expenses</h1>

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
      ) : (
        <RecurringExpenseList items={items} onDelete={handleDelete} />
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Add Recurring Expense</h2>
        <RecurringExpenseForm
          key={formKey}
          categories={categories}
          onSubmit={handleCreate}
          submitError={submitError}
          isSubmitting={isSubmitting}
        />
      </section>
    </div>
  )
}
