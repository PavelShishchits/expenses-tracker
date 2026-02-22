import type { FastifyPluginAsync } from 'fastify'
import { acceptInviteSchema } from '@expenses-tracker/shared'
import { isHttpError } from '../../lib/errors.js'
import * as AccountService from '../../services/account.service.js'

const acceptRoute: FastifyPluginAsync = async (app) => {
  app.post('/', { preHandler: [app.verifyAccessToken] }, async (request, reply) => {
    const parsed = acceptInviteSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(422).send({ error: 'Validation error', details: parsed.error.issues })
    }

    try {
      await AccountService.acceptInvite(request.user!.sub, parsed.data.token)
      return reply.status(200).send({ message: 'Invitation accepted' })
    } catch (err) {
      if (isHttpError(err)) return reply.status(err.statusCode).send({ error: err.message })
      throw err
    }
  })
}

export default acceptRoute
