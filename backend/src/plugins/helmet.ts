import type { FastifyInstance } from 'fastify'
import fastifyHelmet from '@fastify/helmet'

export async function helmetPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fastifyHelmet)
}
