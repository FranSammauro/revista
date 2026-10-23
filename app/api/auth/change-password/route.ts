import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'
import { getPrimarySession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
})

export async function POST(req: NextRequest) {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'user') {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: 'La contraseña actual no es correcta' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  })

  await logAudit({
    action: 'CAMBIO_PASSWORD',
    actorUserId: user.id,
    targetUserId: user.id,
    ip: getClientIp(req),
  })

  return NextResponse.json({ ok: true })
}
