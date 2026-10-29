import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { logAudit, getClientIp } from '@/lib/audit'
import { unlink } from 'node:fs/promises'
import path from 'node:path'

// Solo vos (admin) podés sacarle la foto a alguien — por ejemplo si subió
// algo indebido. No borra la cuenta ni la suspende por sí solo; eso es una
// acción aparte (/suspend) si hace falta combinarlas.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  if (!target.avatarUrl) return NextResponse.json({ error: 'Ese usuario no tiene foto de perfil' }, { status: 400 })

  if (target.avatarUrl.startsWith('/uploads/avatars/')) {
    await unlink(path.join(process.cwd(), 'public', target.avatarUrl)).catch(() => {})
  }

  await prisma.user.update({
    where: { id },
    data: { avatarUrl: null, avatarRemovedBy: admin.userId, avatarRemovedAt: new Date() },
  })

  await logAudit({
    action: 'FOTO_PERFIL_ELIMINADA',
    actorUserId: admin.userId,
    targetUserId: target.id,
    ip: getClientIp(req),
  })

  return NextResponse.json({ ok: true })
}
