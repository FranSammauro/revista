import 'server-only'
import { PrismaClient } from '@prisma/client'

// Evita crear múltiples instancias de PrismaClient en desarrollo
// (Next.js hot-reload reejecuta este módulo en cada cambio)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
