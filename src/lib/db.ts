import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient(): PrismaClient | null {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return null

  try {
    const adapter = new PrismaPg({ connectionString: dbUrl })
    return new PrismaClient({ adapter })
  } catch {
    return null
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined
}

export const prisma: PrismaClient | null =
  globalForPrisma.prisma !== undefined
    ? globalForPrisma.prisma
    : createPrismaClient()

if (prisma && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
