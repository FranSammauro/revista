import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'

// Búsqueda simple de usuarios (alumnos) para el panel de moderación.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const q = req.nextUrl.searchParams.get('q')?.trim() || ''

  const users = await prisma.user.findMany({
    where: q
      ? { OR: [{ email: { contains: q, mode: 'insensitive' } }, { displayName: { contains: q, mode: 'insensitive' } }] }
      : {},
    select: {
      id: true, email: true, displayName: true, role: true, isInstitutional: true,
      emailVerified: true, suspendedUntil: true, suspendReason: true, createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ users })
}
