import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { normalizeEmail } from '@/lib/validators'
import { setPrimarySession } from '@/lib/session'
import { consumeEmailCode } from '@/lib/verification'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({ email: z.string(), code: z.string().length(6) })

// Paso 2: confirma el código y abre la sesión personal del profesor.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const email = normalizeEmail(parsed.data.email)
  const identity = await prisma.teacherIdentity.findUnique({ where: { email } })
  if (!identity) return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400 })

  const result = await consumeEmailCode({
    purpose: 'VERIFICACION_REGISTRO',
    code: parsed.data.code,
    teacherIdentityId: identity.id,
  })
  if (!result.ok) {
    await logAudit({
      action: 'LOGIN_FALLIDO',
      actorTeacherIdentityId: identity.id,
      ip: getClientIp(req),
      metadata: { email, reason: result.error },
    })
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  await prisma.teacherIdentity.update({ where: { id: identity.id }, data: { emailVerified: true } })

  await setPrimarySession({
    kind: 'teacher',
    teacherIdentityId: identity.id,
    email: identity.email,
    displayName: identity.displayName,
  })

  await logAudit({
    action: 'LOGIN',
    actorTeacherIdentityId: identity.id,
    ip: getClientIp(req),
    metadata: { email },
  })

  return NextResponse.json({ ok: true, displayName: identity.displayName })
}
