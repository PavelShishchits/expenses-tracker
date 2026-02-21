import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../lib/prisma.js'

const expenseByIdRoute: FastifyPluginAsync = async (app) => {
  app.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [app.verifyAccessToken] },
    async (request, reply) => {
      const { id } = request.params

      const expense = await prisma.expense.findUnique({ where: { id } })
      if (!expense) {
        return reply.status(404).send({ error: 'Not found' })
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: request.user!.sub },
        select: { accountId: true },
      })
      if (!dbUser) return reply.status(401).send({ error: 'Unauthorized' })

      if (expense.accountId !== dbUser.accountId) {
        return reply.status(403).send({ error: 'Forbidden' })
      }

      await prisma.expense.delete({ where: { id } })
      return reply.status(204).send()
    },
  )
}

export default expenseByIdRoute
