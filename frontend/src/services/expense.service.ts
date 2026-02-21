import { type CreateExpenseInput } from '@expenses-tracker/shared'
import { apiFetch } from './api'
import { type Category } from './category.service'

export type Expense = {
  id: string
  amount: number
  date: string
  accountId: string
  categoryId: string
  createdById: string
  createdAt: string
  updatedAt: string
  category: Category
  createdBy: { id: string; email: string; accountId: string; createdAt: string; updatedAt: string }
}

async function expectJson(res: Response): Promise<unknown> {
  const body = await res.json()
  if (!res.ok) throw new Error((body as { error?: string }).error ?? 'Request failed')
  return body
}

export async function list(from?: string, to?: string): Promise<Expense[]> {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.size > 0 ? `?${params.toString()}` : ''
  const res = await apiFetch(`/expenses${query}`)
  return (await expectJson(res)) as Expense[]
}

export async function create(input: CreateExpenseInput): Promise<Expense> {
  const res = await apiFetch('/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return (await expectJson(res)) as Expense
}

export async function remove(id: string): Promise<void> {
  const res = await apiFetch(`/expenses/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json()
    throw new Error((body as { error?: string }).error ?? 'Request failed')
  }
}
