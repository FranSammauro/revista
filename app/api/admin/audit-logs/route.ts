import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'

// Panel de logs — solo un ADMIN poduede verlo.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const cursor = req.nextUrl.searchParams.get('cursor')
  const take = 50

  const logs = await prisma.auditLog.findMany({
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      actorUser: { select: { email: true, displayName: true } },
      actorTeacherIdentity: { select: { email: true, displayName: true } },
      targetUser: { select: { email: true, displayName: true } },
    },
  })

  const nextCursor = logs.length === take ? logs[logs.length - 1].id : null

  return NextResponse.json({ logs, nextCursor })
}
