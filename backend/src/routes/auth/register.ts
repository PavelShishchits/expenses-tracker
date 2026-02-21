import type { FastifyPluginAsync } from 'fastify'
import { registerSchema } from '@expenses-tracker/shared'
import * as AuthService from '../../services/auth.service.js'
import { signAccessToken, signRefreshToken } from '../../lib/jwt.js'
import { COOKIE_BASE } from '../../lib/cookies.js'

const registerRoute: FastifyPluginAsync = async (app) => {
  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(422).send({
        error: 'Validation error',
        details: parsed.error.issues,
      })
    }

    let user: Awaited<ReturnType<typeof AuthService.register>>
    try {
      user = await AuthService.register(parsed.data)
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode ?? 500
      const message = err instanceof Error ? err.message : 'Internal server error'
      return reply.status(statusCode).send({ error: message })
    }

    const payload = { sub: user.id, email: user.email }
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken(payload),
      signRefreshToken(payload),
    ])

    reply
      .setCookie('access_token', accessToken, { ...COOKIE_BASE })
      .setCookie('refresh_token', refreshToken, { ...COOKIE_BASE, maxAge: 2592000 })
      .status(201)
      .send({ user })
  })
}

export default registerRoute
