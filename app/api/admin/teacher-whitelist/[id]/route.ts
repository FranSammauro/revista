import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { logAudit, getClientIp } from '@/lib/audit'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const entry = await prisma.teacherWhitelistEntry.findUnique({ where: { id } })
  if (!entry) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  await prisma.teacherWhitelistEntry.delete({ where: { id } })

  await logAudit({
    action: 'WHITELIST_PROFESOR_QUITADO',
    actorUserId: admin.userId,
    ip: getClientIp(req),
    metadata: { email: entry.email },
  })

  return NextResponse.json({ ok: true })
}
