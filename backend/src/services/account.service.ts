import { randomBytes } from 'node:crypto'
import { makeHttpError } from '../lib/errors.js'
import { prisma } from '../lib/prisma.js'

export async function get(accountId: string) {
  const members = await prisma.user.findMany({
    where: { accountId },
    select: { id: true, email: true, createdAt: true },
  })

  const invitation = await prisma.accountInvitation.findFirst({
    where: {
      accountId,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { invitedEmail: true, expiresAt: true },
  })

  return {
    members: members.map((u) => ({ id: u.id, email: u.email, joinedAt: u.createdAt })),
    pendingInvitation: invitation ?? null,
  }
}

export async function invite(accountId: string, invitedEmail: string): Promise<string> {
  const memberCount = await prisma.user.count({ where: { accountId } })
  if (memberCount >= 2) {
    throw makeHttpError('Account is already full', 400)
  }

  const existingInvitation = await prisma.accountInvitation.findFirst({
    where: {
      accountId,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  })
  if (existingInvitation) {
    throw makeHttpError('A pending invitation already exists', 400)
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.accountInvitation.create({
    data: { accountId, invitedEmail, token, expiresAt },
  })

  return token
}

export async function acceptInvite(userId: string, token: string): Promise<void> {
  const invitation = await prisma.accountInvitation.findUnique({
    where: { token },
    select: { accountId: true, acceptedAt: true, expiresAt: true },
  })

  if (!invitation) {
    throw makeHttpError('Invalid or expired invitation', 400)
  }
  if (invitation.acceptedAt !== null) {
    throw makeHttpError('Invitation already used', 400)
  }
  if (invitation.expiresAt <= new Date()) {
    throw makeHttpError('Invalid or expired invitation', 400)
  }

  const memberCount = await prisma.user.count({ where: { accountId: invitation.accountId } })
  if (memberCount >= 2) {
    throw makeHttpError('Account is already full', 400)
  }

  await prisma.$transaction([
    prisma.accountInvitation.update({ where: { token }, data: { acceptedAt: new Date() } }),
    prisma.user.update({ where: { id: userId }, data: { accountId: invitation.accountId } }),
  ])
}

export async function removeMember(
  requestingUserId: string,
  targetUserId: string,
  accountId: string,
): Promise<void> {
  const requestingUser = await prisma.user.findUnique({
    where: { id: requestingUserId },
    select: { accountId: true },
  })
  if (!requestingUser || requestingUser.accountId !== accountId) {
    throw makeHttpError('Forbidden', 403)
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { accountId: true },
  })
  if (!targetUser || targetUser.accountId !== accountId) {
    throw makeHttpError('Not found', 404)
  }

  if (requestingUserId === targetUserId) {
    throw makeHttpError('Cannot remove yourself', 400)
  }

  await prisma.$transaction(async (tx) => {
    const newAccount = await tx.account.create({ data: {} })
    await tx.user.update({ where: { id: targetUserId }, data: { accountId: newAccount.id } })
  })
}
