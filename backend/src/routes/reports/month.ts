import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../lib/prisma.js'
import * as ReportService from '../../services/report.service.js'
import { isHttpError } from '../../lib/errors.js'

const monthReportRoute: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: { year?: string; month?: string } }>(
    '/month',
    { preHandler: [app.verifyAccessToken] },
    async (request, reply) => {
      const now = new Date()
      const year = request.query.year ? parseInt(request.query.year, 10) : now.getUTCFullYear()
      const month = request.query.month ? parseInt(request.query.month, 10) : now.getUTCMonth() + 1

      if (isNaN(year) || year < 2000 || year > 2100) return reply.status(400).send({ error: 'Invalid year' })
      if (isNaN(month) || month < 1 || month > 12) return reply.status(400).send({ error: 'Invalid month (1-12)' })

      const dbUser = await prisma.user.findUnique({
        where: { id: request.user!.sub },
        select: { accountId: true },
      })
      if (!dbUser) return reply.status(401).send({ error: 'Unauthorized' })

      try {
        const data = await ReportService.getMonth(dbUser.accountId, year, month)
        return reply.status(200).send(data)
      } catch (err) {
        const statusCode = isHttpError(err) ? err.statusCode : 500
        const message = err instanceof Error ? err.message : 'Internal server error'
        return reply.status(statusCode).send({ error: message })
      }
    },
  )
}

export default monthReportRoute
