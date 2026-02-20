import type { FastifyInstance } from 'fastify'
import fastifyCookie from '@fastify/cookie'

export async function cookiesPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fastifyCookie)
}
