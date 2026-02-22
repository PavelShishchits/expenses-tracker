import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import * as AccountService from '../../services/account.service.js'
import inviteRoute from './invite.js'
import acceptRoute from './accept.js'
import membersRoute from './members.js'

const accountsRoute: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })
    if (!dbUser) return reply.status(401).send({ error: 'Unauthorized' })

    const account = await AccountService.get(dbUser.accountId)
    return reply.status(200).send(account)
  })

  await app.register(inviteRoute, { prefix: '/invite' })
  await app.register(acceptRoute, { prefix: '/invite/accept' })
  await app.register(membersRoute, { prefix: '/members' })
}

export default accountsRoute
