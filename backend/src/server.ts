import { buildApp } from './app.js'
import { prisma } from './lib/prisma.js'

const PORT = Number(process.env.PORT) || 4000

const REQUIRED_ENV = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL']

async function start(): Promise<void> {
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      console.error(`Missing required environment variable: ${key}`)
      process.exit(1)
    }
  }

  const app = await buildApp()

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

start()
