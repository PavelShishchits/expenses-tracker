import type { FastifyPluginAsync } from 'fastify'
import monthReportRoute from './month.js'
import yearReportRoute from './year.js'

const reportsRoutes: FastifyPluginAsync = async (app) => {
  await app.register(monthReportRoute)
  await app.register(yearReportRoute)
}

export default reportsRoutes
