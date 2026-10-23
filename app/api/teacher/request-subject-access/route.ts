import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPrimarySession } from '@/lib/session'
import { randomToken } from '@/lib/password'
import { sendTeacherAccessLinkEmail } from '@/lib/mailer'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({ subjectSlug: z.string() })

const APP_URL = process.env.APP_URL || 'http://localhost:3000'

// El profesor (ya logueado con su identidad personal) pide entrar a la
// cuenta compartida de una materia. Se manda un link de un solo uso por mail
// — nunca se envía ni se guarda una contraseña en texto plano.
export async function POST(req: NextRequest) {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'teacher') {
    return NextResponse.json({ error: 'No autenticado como docente' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const whitelistEntry = await prisma.teacherWhitelistEntry.findFirst({
    where: { email: session.email, subject: { slug: parsed.data.subjectSlug } },
    include: { subject: { include: { subjectAccount: true } } },
  })

  if (!whitelistEntry || !whitelistEntry.subject.subjectAccount) {
    return NextResponse.json({ error: 'No tenés acceso habilitado a esa materia' }, { status: 403 })
  }

  const token = randomToken()
  await prisma.teacherAccess.create({
    data: {
      teacherIdentityId: session.teacherIdentityId,
      subjectAccountId: whitelistEntry.subject.subjectAccount.id,
      whitelistEntryId: whitelistEntry.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    },
  })

  const accessUrl = `${APP_URL}/panel-materia/confirmar?token=${token}`
  await sendTeacherAccessLinkEmail(session.email, session.displayName, whitelistEntry.subject.label, accessUrl)

  await logAudit({
    action: 'ACCESO_TEMPORAL_PROFESOR',
    actorTeacherIdentityId: session.teacherIdentityId,
    actingAsSubjectUsername: whitelistEntry.subject.subjectAccount.username,
    ip: getClientIp(req),
    metadata: { subjectSlug: parsed.data.subjectSlug, step: 'solicitado' },
  })

  return NextResponse.json({ ok: true, message: `Te enviamos un link de acceso a ${whitelistEntry.subject.label} por mail.` })
}
