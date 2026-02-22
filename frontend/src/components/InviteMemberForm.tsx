'use client'

import { useState } from 'react'
import { z } from 'zod'
import type { PendingInvitation } from '@/services/account.service'

type Props = {
  pendingInvitation: PendingInvitation | null
  memberCount: number
  onInvite: (email: string) => Promise<void>
  isSubmitting?: boolean
  submitError?: string | null
  successToken?: string | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function InviteMemberForm({
  pendingInvitation,
  memberCount,
  onInvite,
  isSubmitting,
  submitError,
  successToken,
}: Props) {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailError(null)

    const result = z.string().email().safeParse(email)
    if (!result.success) {
      setEmailError('Please enter a valid email address')
      return
    }

    try {
      await onInvite(result.data)
      setEmail('')
    } catch {
      // parent's onInvite handles error state
    }
  }

  if (pendingInvitation !== null) {
    return (
      <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600">
        Pending invite to <span className="font-medium">{pendingInvitation.invitedEmail}</span>, expires{' '}
        {formatDate(pendingInvitation.expiresAt)}
      </div>
    )
  }

  if (memberCount >= 2) {
    return <p className="text-sm text-gray-500">Account is full (2/2 members)</p>
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      {submitError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </p>
      )}

      {successToken && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          <p>Invitation created. Share this token:</p>
          <p className="mt-1 select-all font-mono text-xs break-all">{successToken}</p>
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 space-y-1">
          <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {emailError && (
            <p role="alert" className="text-xs text-red-600">
              {emailError}
            </p>
          )}
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending…' : 'Send Invite'}
          </button>
        </div>
      </div>
    </form>
  )
}
