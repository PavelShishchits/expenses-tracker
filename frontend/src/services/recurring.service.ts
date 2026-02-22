import type { CreateRecurringInput } from '@expenses-tracker/shared'
import { apiFetch } from './api'

export type RecurringCategory = {
  id: string
  title: string
  icon: string
  iconColor: string
}

export type RecurringExpense = {
  id: string
  amount: number
  label: string
  accountId: string
  activeFrom: string
  deletedAt: string | null
  createdAt: string
  category: RecurringCategory | null
}

type RawRecurringExpense = Omit<RecurringExpense, 'amount'> & { amount: string | number }

function normalize(raw: RawRecurringExpense): RecurringExpense {
  return { ...raw, amount: Number(raw.amount) }
}

async function expectJson(res: Response): Promise<unknown> {
  const body = await res.json()
  if (!res.ok) throw new Error((body as { error?: string }).error ?? 'Request failed')
  return body
}

export async function list(): Promise<RecurringExpense[]> {
  const res = await apiFetch('/recurring')
  const body = (await expectJson(res)) as { recurringExpenses: RawRecurringExpense[] }
  return body.recurringExpenses.map(normalize)
}

export async function create(input: CreateRecurringInput): Promise<RecurringExpense> {
  const res = await apiFetch('/recurring', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = (await expectJson(res)) as { recurringExpense: RawRecurringExpense }
  return normalize(body.recurringExpense)
}

export async function remove(id: string): Promise<void> {
  const res = await apiFetch(`/recurring/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = (await res.json()) as { error?: string }
    throw new Error(body.error ?? 'Request failed')
  }
}
