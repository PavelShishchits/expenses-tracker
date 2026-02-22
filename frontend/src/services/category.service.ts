import type { CreateCategoryInput } from '@expenses-tracker/shared'
import { apiFetch } from './api'

export type Category = {
  id: string
  title: string
  icon: string
  iconColor: string
  isSystem: boolean
  accountId: string | null
  createdAt: string
}

async function expectJson(res: Response): Promise<unknown> {
  const body = await res.json()
  if (!res.ok) throw new Error((body as { error?: string }).error ?? 'Request failed')
  return body
}

export async function list(): Promise<Category[]> {
  const res = await apiFetch('/categories')
  const body = (await expectJson(res)) as { categories: Category[] }
  return body.categories
}

export async function create(input: CreateCategoryInput): Promise<Category> {
  const res = await apiFetch('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = (await expectJson(res)) as { category: Category }
  return body.category
}

export async function remove(id: string): Promise<void> {
  const res = await apiFetch(`/categories/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = (await res.json()) as { error?: string }
    throw new Error(body.error ?? 'Request failed')
  }
}
