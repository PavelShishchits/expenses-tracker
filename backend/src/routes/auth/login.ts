import type { FastifyPluginAsync } from 'fastify'
import { loginSchema } from '@expenses-tracker/shared'
import * as AuthService from '../../services/auth.service.js'
import { signAccessToken, signRefreshToken } from '../../lib/jwt.js'

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
} as const

const loginRoute: FastifyPluginAsync = async (app) => {
  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(422).send({
        error: 'Validation error',
        details: parsed.error.issues,
      })
    }

    let user: Awaited<ReturnType<typeof AuthService.login>>
    try {
      user = await AuthService.login(parsed.data)
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
      .status(200)
      .send({ user })
  })
}

export default loginRoute
