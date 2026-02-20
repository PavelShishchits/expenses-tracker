import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { verifyAccessToken as verifyJwtToken, type JwtPayload } from '../lib/jwt.js'

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload | null
  }
  interface FastifyInstance {
    verifyAccessToken: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

// Called directly on root app instance (not via app.register) so decorations
// are visible in all child route scopes without needing fastify-plugin.
export function setupAuth(app: FastifyInstance): void {
  app.decorateRequest('user', null)

  app.decorate(
    'verifyAccessToken',
    async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const token = request.cookies?.access_token
      if (!token) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }
      try {
        request.user = await verifyJwtToken(token)
      } catch {
        return reply.status(401).send({ error: 'Unauthorized' })
      }
    },
  )
}
