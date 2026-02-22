import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { isHttpError } from '../../lib/errors.js'
import * as AccountService from '../../services/account.service.js'

const membersRoute: FastifyPluginAsync = async (app) => {
  app.delete<{ Params: { userId: string } }>('/:userId', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })
    if (!dbUser) return reply.status(401).send({ error: 'Unauthorized' })

    try {
      await AccountService.removeMember(request.user!.sub, request.params.userId, dbUser.accountId)
      return reply.status(204).send()
    } catch (err) {
      if (isHttpError(err)) return reply.status(err.statusCode).send({ error: err.message })
      throw err
    }
  })
}

export default membersRoute
