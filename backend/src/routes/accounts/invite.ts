import type { FastifyPluginAsync } from 'fastify'
import { inviteSchema } from '@expenses-tracker/shared'
import { prisma } from '../../lib/prisma.js'
import { isHttpError } from '../../lib/errors.js'
import * as AccountService from '../../services/account.service.js'

const inviteRoute: FastifyPluginAsync = async (app) => {
  app.post('/', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const parsed = inviteSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Validation error', details: parsed.error.issues })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })
    if (!dbUser) return reply.status(401).send({ error: 'Unauthorized' })

    try {
      const token = await AccountService.invite(dbUser.accountId, parsed.data.email)
      return reply.status(201).send({ message: 'Invitation created', token })
    } catch (err) {
      if (isHttpError(err)) return reply.status(err.statusCode).send({ error: err.message })
      throw err
    }
  })
}

export default inviteRoute
