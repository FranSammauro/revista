import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { setSubjectSession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

// NOTA DE SEGURIDAD: este endpoint consume el token (POST, disparado por un
// clic explícito en /panel-materia/confirmar). A propósito NO es un GET:
// varios clientes de mail (Outlook Safe Links, escáneres corporativos)
// pre-visitan automáticamente cualquier link que llega por mail para
// escanearlo. Si consumiéramos el token con un GET directo desde el mail,
// ese escaneo automático quemaría el acceso de un solo uso antes de que el
// profesor llegue a hacer clic.
const schema = z.object({ token: z.string() })

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Token inválido' }, { status: 400 })

  const access = await prisma.teacherAccess.findUnique({
    where: { token: parsed.data.token },
    include: {
      teacherIdentity: true,
      subjectAccount: { include: { subject: true } },
    },
  })

  if (!access || access.usedAt || access.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Este link ya fue usado o expiró. Pedí uno nuevo.' }, { status: 400 })
  }

  await prisma.teacherAccess.update({ where: { id: access.id }, data: { usedAt: new Date() } })

  await setSubjectSession({
    kind: 'subject',
    subjectAccountId: access.subjectAccount.id,
    subjectSlug: access.subjectAccount.subject.slug,
    subjectLabel: access.subjectAccount.subject.label,
    username: access.subjectAccount.username,
    actingTeacherIdentityId: access.teacherIdentity.id,
    actingTeacherEmail: access.teacherIdentity.email,
  })

  await logAudit({
    action: 'ACCESO_TEMPORAL_PROFESOR',
    actorTeacherIdentityId: access.teacherIdentity.id,
    actingAsSubjectUsername: access.subjectAccount.username,
    ip: getClientIp(req),
    metadata: { step: 'consumido' },
  })

  const redirectTo = access.subjectAccount.mustChangePassword ? '/panel-materia/nueva-contrasena' : '/panel-materia'
  return NextResponse.json({ ok: true, redirectTo, subjectLabel: access.subjectAccount.subject.label })
}

// GET: solo para mostrar datos del link ANTES de consumirlo (usado por la
// página de confirmación para saber a qué materia corresponde). No marca
// el token como usado.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token inválido' }, { status: 400 })

  const access = await prisma.teacherAccess.findUnique({
    where: { token },
    include: { subjectAccount: { include: { subject: true } } },
  })

  if (!access || access.usedAt || access.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Este link ya fue usado o expiró. Pedí uno nuevo.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, subjectLabel: access.subjectAccount.subject.label })
}
