import { type RegisterInput, type LoginInput } from '@expenses-tracker/shared'
import { prisma } from '../lib/prisma.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import { makeHttpError } from '../lib/errors.js'

export async function register(input: RegisterInput) {
  const passwordHash = await hashPassword(input.password)

  const { passwordHash: _pw, ...user } = await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({ where: { email: input.email } })
    if (existing) throw makeHttpError('Email already in use', 409)

    const account = await tx.account.create({ data: {} })
    return tx.user.create({
      data: { email: input.email, passwordHash, accountId: account.id },
    })
  })

  return user
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw makeHttpError('Invalid email or password', 401)
  }

  const { passwordHash: _pw, ...safeUser } = user
  return safeUser
}
