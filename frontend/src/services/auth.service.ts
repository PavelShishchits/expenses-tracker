import { type LoginInput, type RegisterInput } from '@expenses-tracker/shared'
import { apiFetch } from './api'

export type AuthUser = {
  id: string
  email: string
  createdAt: string
}

async function expectJson(res: Response): Promise<unknown> {
  const body = await res.json()
  if (!res.ok) throw new Error((body as { error?: string }).error ?? 'Request failed')
  return body
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = (await expectJson(res)) as { user: AuthUser }
  return body.user
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  const body = (await expectJson(res)) as { user: AuthUser }
  return body.user
}

export async function logout(): Promise<void> {
  const res = await apiFetch('/auth/logout', { method: 'POST' })
  if (!res.ok) {
    const body = await res.json()
    throw new Error((body as { error?: string }).error ?? 'Request failed')
  }
}

export async function refresh(): Promise<AuthUser> {
  const res = await apiFetch('/auth/refresh', { method: 'POST' })
  const body = (await expectJson(res)) as { user: Pick<AuthUser, 'id' | 'email'> }
  return { ...body.user, createdAt: '' }
}
