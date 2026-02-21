import type { FastifyPluginAsync } from 'fastify'
import registerRoute from './register.js'
import loginRoute from './login.js'
import logoutRoute from './logout.js'
import refreshRoute from './refresh.js'

const authRoutes: FastifyPluginAsync = async (app) => {
  await app.register(registerRoute)
  await app.register(loginRoute)
  await app.register(logoutRoute)
  await app.register(refreshRoute)
}

export default authRoutes
