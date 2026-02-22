import { apiFetch } from './api'

export type AccountMember = {
  id: string
  email: string
  joinedAt: string
}

export type PendingInvitation = {
  invitedEmail: string
  expiresAt: string
}

export type AccountData = {
  members: AccountMember[]
  pendingInvitation: PendingInvitation | null
}

async function expectJson(res: Response): Promise<unknown> {
  const body = await res.json()
  if (!res.ok) throw new Error((body as { error?: string }).error ?? 'Request failed')
  return body
}

export async function get(): Promise<AccountData> {
  const res = await apiFetch('/account')
  const body = (await expectJson(res)) as { members: AccountMember[]; pendingInvitation: PendingInvitation | null }
  return { members: body.members, pendingInvitation: body.pendingInvitation }
}

export async function invite(email: string): Promise<{ message: string; token: string }> {
  const res = await apiFetch('/account/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const body = (await expectJson(res)) as { message: string; token: string }
  return body
}

export async function acceptInvite(token: string): Promise<void> {
  const res = await apiFetch('/account/invite/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  await expectJson(res)
}

export async function removeMember(userId: string): Promise<void> {
  const res = await apiFetch(`/account/members/${userId}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = (await res.json()) as { error?: string }
    throw new Error(body.error ?? 'Request failed')
  }
}
