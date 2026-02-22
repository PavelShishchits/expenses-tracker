import type { FastifyPluginAsync } from 'fastify'
import { createRecurringSchema } from '@expenses-tracker/shared'
import { prisma } from '../../lib/prisma.js'
import { isHttpError } from '../../lib/errors.js'
import * as RecurringService from '../../services/recurring.service.js'
import recurringByIdRoute from './[id].js'

const recurringRoute: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })
    if (!dbUser) return reply.status(401).send({ error: 'Unauthorized' })

    const recurringExpenses = await RecurringService.list(dbUser.accountId)
    return reply.status(200).send({ recurringExpenses })
  })

  app.post('/', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const parsed = createRecurringSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Validation error', details: parsed.error.issues })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })
    if (!dbUser) return reply.status(401).send({ error: 'Unauthorized' })

    try {
      const recurringExpense = await RecurringService.create(dbUser.accountId, request.user!.sub, parsed.data)
      return reply.status(201).send({ recurringExpense })
    } catch (err) {
      if (isHttpError(err)) return reply.status(err.statusCode).send({ error: err.message })
      throw err
    }
  })

  await app.register(recurringByIdRoute)
}

export default recurringRoute
