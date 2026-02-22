'use client'

import { useEffect, useState } from 'react'
import { useAppAuth } from '@/app/(app)/layout'
import { get, invite, removeMember, type AccountData } from '@/services/account.service'
import MemberList from '@/components/MemberList'
import InviteMemberForm from '@/components/InviteMemberForm'

export default function AccountPage() {
  const { user } = useAppAuth()
  const [accountData, setAccountData] = useState<AccountData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [isInviting, setIsInviting] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)

  async function fetchAccountData() {
    try {
      const data = await get()
      setAccountData(data)
    } catch {
      // background refetch — stale data remains visible
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setFetchError(null)
        const data = await get()
        if (!cancelled) setAccountData(data)
      } catch (err) {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : 'Failed to load account data')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function handleInvite(email: string) {
    setIsInviting(true)
    setInviteError(null)
    setInviteToken(null)
    try {
      const result = await invite(email)
      setInviteToken(result.token)
      await fetchAccountData()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  async function handleRemove(userId: string) {
    try {
      await removeMember(userId)
      await fetchAccountData()
      setRemoveError(null)
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : 'Failed to remove member')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Account</h1>

      {removeError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {removeError}
        </p>
      )}

      {isLoading ? (
        <div role="status" className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span className="sr-only">Loading…</span>
        </div>
      ) : fetchError ? (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {fetchError}
        </p>
      ) : accountData && (
        <>
          <section className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-gray-800">Members</h2>
            <MemberList
              members={accountData.members}
              currentUserId={user?.id ?? ''}
              onRemove={handleRemove}
            />
          </section>

          {accountData.members.length < 2 && (
            <section className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 text-base font-semibold text-gray-800">Invite Member</h2>
              <InviteMemberForm
                pendingInvitation={accountData.pendingInvitation}
                memberCount={accountData.members.length}
                onInvite={handleInvite}
                isSubmitting={isInviting}
                submitError={inviteError}
                successToken={inviteToken}
              />
            </section>
          )}
        </>
      )}
    </div>
  )
}
