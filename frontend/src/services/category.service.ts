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
  return (await expectJson(res)) as Category[]
}
