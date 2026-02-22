import type { AccountMember } from '@/services/account.service'

type Props = {
  members: AccountMember[]
  currentUserId: string
  onRemove: (userId: string) => void
}

export default function MemberList({ members, currentUserId, onRemove }: Props) {
  function handleRemove(member: AccountMember) {
    if (window.confirm('Remove this member? They will get a new empty account.')) {
      onRemove(member.id)
    }
  }

  return (
    <ul className="divide-y divide-gray-100">
      {members.map((member) => (
        <li key={member.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-900">{member.email}</span>
            {member.id === currentUserId && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">You</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">
              Joined{' '}
              {new Date(member.joinedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {member.id !== currentUserId && (
              <button
                type="button"
                onClick={() => handleRemove(member)}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
