import type { FastifyPluginAsync } from 'fastify'
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '../../lib/jwt.js'
import { COOKIE_BASE } from '../../lib/cookies.js'

const refreshRoute: FastifyPluginAsync = async (app) => {
  app.post('/refresh', async (request, reply) => {
    const token = request.cookies?.refresh_token
    if (!token) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    let payload: Awaited<ReturnType<typeof verifyRefreshToken>>
    try {
      payload = await verifyRefreshToken(token)
    } catch {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const jwtPayload = { sub: payload.sub, email: payload.email }
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(jwtPayload),
      signRefreshToken(jwtPayload),
    ])

    reply
      .setCookie('access_token', accessToken, { ...COOKIE_BASE })
      .setCookie('refresh_token', refreshToken, { ...COOKIE_BASE, maxAge: 2592000 })
      .status(200)
      .send({ user: { id: payload.sub, email: payload.email } })
  })
}

export default refreshRoute
