import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPrimarySession, getSubjectSession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({
  days: z.number().int().min(0).max(365), // 0 = levantar la suspensión
  reason: z.string().min(3).max(300).optional(),
})

// Autorizado para ADMIN (vos) o cualquier profesor con una sesión de materia
// activa (un profe de Física puede suspender a alguien por un comentario en
// un artículo de Biología — queda registrado en el log con qué cuenta actuó).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const primary = await getPrimarySession()
  const subject = await getSubjectSession()

  const isAdmin = primary?.kind === 'user' && primary.role === 'ADMIN'
  if (!isAdmin && !subject) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const suspendedUntil = parsed.data.days > 0 ? new Date(Date.now() + parsed.data.days * 24 * 60 * 60 * 1000) : null

  await prisma.user.update({
    where: { id },
    data: { suspendedUntil, suspendReason: suspendedUntil ? parsed.data.reason : null },
  })

  await logAudit({
    action: suspendedUntil ? 'USUARIO_SUSPENDIDO' : 'USUARIO_REACTIVADO',
    actorUserId: isAdmin ? primary!.userId : undefined,
    actorTeacherIdentityId: subject ? subject.actingTeacherIdentityId : undefined,
    actingAsSubjectUsername: subject ? subject.username : undefined,
    targetUserId: target.id,
    ip: getClientIp(req),
    metadata: { days: parsed.data.days, reason: parsed.data.reason },
  })

  return NextResponse.json({ ok: true })
}
