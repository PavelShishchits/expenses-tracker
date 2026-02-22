import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import { isHttpError } from '../../lib/errors.js'
import * as CategoryService from '../../services/category.service.js'

const categoryByIdRoute: FastifyPluginAsync = async (app) => {
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })
    if (!dbUser) return reply.status(401).send({ error: 'Unauthorized' })

    try {
      await CategoryService.remove(dbUser.accountId, request.params.id)
      return reply.status(204).send()
    } catch (err) {
      if (isHttpError(err)) return reply.status(err.statusCode).send({ error: err.message })
      throw err
    }
  })
}

export default categoryByIdRoute
