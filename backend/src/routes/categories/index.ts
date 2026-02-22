import type { FastifyPluginAsync } from 'fastify'
import { createCategorySchema } from '@expenses-tracker/shared'
import { prisma } from '../../lib/prisma.js'
import { isHttpError } from '../../lib/errors.js'
import * as CategoryService from '../../services/category.service.js'

const categoriesRoute: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })
    if (!dbUser) return reply.status(401).send({ error: 'Unauthorized' })

    const categories = await CategoryService.list(dbUser.accountId)
    return reply.status(200).send({ categories })
  })

  app.post('/', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const parsed = createCategorySchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Validation error', details: parsed.error.issues })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })
    if (!dbUser) return reply.status(401).send({ error: 'Unauthorized' })

    try {
      const category = await CategoryService.create(dbUser.accountId, parsed.data)
      return reply.status(201).send({ category })
    } catch (err) {
      if (isHttpError(err)) return reply.status(err.statusCode).send({ error: err.message })
      throw err
    }
  })
}

export default categoriesRoute
