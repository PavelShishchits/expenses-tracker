import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const url = process.env.DATABASE_URL
if (!url) throw new Error('Missing required environment variable: DATABASE_URL')

const adapter = new PrismaPg({ connectionString: url })

export const prisma = new PrismaClient({ adapter })
