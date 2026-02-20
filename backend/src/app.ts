import fastify, { type FastifyInstance } from 'fastify'
import { cookiesPlugin } from './plugins/cookies.js'
import { corsPlugin } from './plugins/cors.js'
import { helmetPlugin } from './plugins/helmet.js'
import { setupAuth } from './plugins/auth.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: process.env.NODE_ENV !== 'test',
  })

  // External plugins register themselves on root via fastify-plugin internally
  await app.register(helmetPlugin)
  await app.register(corsPlugin)
  await app.register(cookiesPlugin)

  // Auth decorators added directly to root so all route scopes inherit them
  setupAuth(app)

  app.get('/health', async () => ({ status: 'ok' }))

  // Route groups registered here in Phase 3+

  return app
}
