import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, randomSixDigitCode } from '@/lib/password'
import { isInstitutionalEmailFormat, isValidEmailFormat, normalizeEmail, displayNameFromInstitutionalEmail } from '@/lib/validators'
import { sendVerificationCodeEmail } from '@/lib/mailer'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({
  email: z.string().min(3),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  // Solo requerido/usado si el mail NO es institucional (el alumno elige su nombre)
  displayName: z.string().min(2).max(60).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 })
  }

  const email = normalizeEmail(parsed.data.email)
  if (!isValidEmailFormat(email)) {
    return NextResponse.json({ error: 'El mail no tiene un formato válido' }, { status: 400 })
  }

  const institutional = isInstitutionalEmailFormat(email)
  const displayName = institutional
    ? displayNameFromInstitutionalEmail(email)
    : parsed.data.displayName

  if (!institutional && !displayName) {
    return NextResponse.json({ error: 'Elegí un nombre para mostrar' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese mail' }, { status: 409 })
  }

  const ip = getClientIp(req)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(parsed.data.password),
      displayName: displayName!,
      role: 'ALUMNO',
      isInstitutional: institutional,
      emailVerified: false,
      registrationIp: ip,
    },
  })

  const code = randomSixDigitCode()
  await prisma.emailToken.create({
    data: {
      purpose: 'VERIFICACION_REGISTRO',
      userId: user.id,
      code,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  })
  await sendVerificationCodeEmail(email, user.displayName, code)

  await logAudit({
    action: 'REGISTRO_USUARIO',
    actorUserId: user.id,
    targetUserId: user.id,
    ip,
    metadata: { email, institutional },
  })

  return NextResponse.json({
    ok: true,
    message: 'Cuenta creada. Revisá tu mail para verificarla.',
    canPublish: institutional,
  })
}
