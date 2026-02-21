import type { FastifyPluginAsync } from 'fastify'

const logoutRoute: FastifyPluginAsync = async (app) => {
  app.post('/logout', { preHandler: app.verifyAccessToken }, async (request, reply) => {
    reply
      .setCookie('access_token', '', { path: '/', maxAge: 0 })
      .setCookie('refresh_token', '', { path: '/', maxAge: 0 })
      .status(204)
      .send()
  })
}

export default logoutRoute
