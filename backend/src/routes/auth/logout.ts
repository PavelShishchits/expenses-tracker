import type { FastifyPluginAsync } from 'fastify'
import { COOKIE_BASE } from '../../lib/cookies.js'

const logoutRoute: FastifyPluginAsync = async (app) => {
  app.post('/logout', { preHandler: app.verifyAccessToken }, async (request, reply) => {
    reply
      .setCookie('access_token', '', { ...COOKIE_BASE, maxAge: 0 })
      .setCookie('refresh_token', '', { ...COOKIE_BASE, maxAge: 0 })
      .status(204)
      .send()
  })
}

export default logoutRoute
