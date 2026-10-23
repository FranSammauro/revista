import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { normalizeEmail } from '@/lib/validators'
import { consumeEmailCode } from '@/lib/verification'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({
  email: z.string(),
  code: z.string().length(6),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const email = normalizeEmail(parsed.data.email)
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 })
  }

  const result = await consumeEmailCode({
    purpose: 'VERIFICACION_REGISTRO',
    code: parsed.data.code,
    userId: user.id,
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } })

  await logAudit({
    action: 'VERIFICACION_EMAIL',
    actorUserId: user.id,
    targetUserId: user.id,
    ip: getClientIp(req),
  })

  return NextResponse.json({ ok: true })
}
