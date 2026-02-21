import type { FastifyPluginAsync } from 'fastify'
import { createExpenseSchema } from '@expenses-tracker/shared'
import { prisma } from '../../lib/prisma.js'
import * as ExpenseService from '../../services/expense.service.js'

const expensesRoute: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const { from, to } = request.query as { from?: string; to?: string }

    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })

    try {
      const raw = await ExpenseService.list(dbUser!.accountId, from, to)
      const expenses = raw.map((e) => ({ ...e, amount: e.amount.toNumber() }))
      return reply.status(200).send({ expenses })
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode ?? 500
      const message = err instanceof Error ? err.message : 'Internal server error'
      return reply.status(statusCode).send({ error: message })
    }
  })

  app.post('/', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const parsed = createExpenseSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Validation error', details: parsed.error.issues })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: request.user!.sub },
      select: { accountId: true },
    })

    try {
      const expense = await ExpenseService.create(dbUser!.accountId, request.user!.sub, parsed.data)
      return reply.status(201).send({ expense: { ...expense, amount: expense.amount.toNumber() } })
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode ?? 500
      const message = err instanceof Error ? err.message : 'Internal server error'
      return reply.status(statusCode).send({ error: message })
    }
  })
}

export default expensesRoute
