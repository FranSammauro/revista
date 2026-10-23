import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { normalizeEmail, isInstitutionalEmailFormat } from '@/lib/validators'
import { randomSixDigitCode } from '@/lib/password'
import { sendVerificationCodeEmail } from '@/lib/mailer'

const schema = z.object({ email: z.string() })

// Paso 1 del login de profesor: pide un código al mail institucional docente.
// Solo funciona si el mail está en la whitelist dinámica de al menos una materia.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const email = normalizeEmail(parsed.data.email)
  if (!isInstitutionalEmailFormat(email)) {
    return NextResponse.json({ error: 'Usá tu mail institucional docente (nombre.apellido@institutoverbodivino.edu.ar)' }, { status: 400 })
  }

  const whitelisted = await prisma.teacherWhitelistEntry.findFirst({ where: { email } })
  // Respuesta genérica aunque no esté habilitado, para no revelar qué mails son docentes.
  if (!whitelisted) {
    return NextResponse.json({ ok: true, message: 'Si el mail está habilitado, vas a recibir un código.' })
  }

  const identity = await prisma.teacherIdentity.upsert({
    where: { email },
    update: {},
    create: { email, displayName: whitelisted.displayName || email.split('@')[0] },
  })

  const code = randomSixDigitCode()
  await prisma.emailToken.create({
    data: {
      purpose: 'VERIFICACION_REGISTRO',
      teacherIdentityId: identity.id,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  })
  await sendVerificationCodeEmail(email, identity.displayName, code)

  return NextResponse.json({ ok: true, message: 'Si el mail está habilitado, vas a recibir un código.' })
}
