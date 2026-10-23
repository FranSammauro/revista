import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'
import { getSubjectSession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({
  // No se pide "contraseña actual" en el primer seteo (mustChangePassword=true
  // y passwordHash es null); si ya hay una, sí se exige para cambiarla.
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export async function POST(req: NextRequest) {
  const session = await getSubjectSession()
  if (!session) return NextResponse.json({ error: 'No hay una sesión de materia activa' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 })
  }

  const account = await prisma.subjectAccount.findUnique({ where: { id: session.subjectAccountId } })
  if (!account) return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })

  if (account.passwordHash) {
    if (!parsed.data.currentPassword || !(await verifyPassword(parsed.data.currentPassword, account.passwordHash))) {
      return NextResponse.json({ error: 'La contraseña actual no es correcta' }, { status: 400 })
    }
  }

  await prisma.subjectAccount.update({
    where: { id: account.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
      mustChangePassword: false,
    },
  })

  await logAudit({
    action: 'CAMBIO_PASSWORD',
    actorTeacherIdentityId: session.actingTeacherIdentityId,
    actingAsSubjectUsername: session.username,
    ip: getClientIp(req),
  })

  return NextResponse.json({ ok: true })
}
