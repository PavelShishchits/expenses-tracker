import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import * as CategoryService from '../../services/category.service.js'

const categoriesRoute: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })
    const categories = await CategoryService.list(dbUser!.accountId)
    return reply.status(200).send({ categories })
  })
}

export default categoriesRoute
