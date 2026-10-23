import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/require-admin'
import { isInstitutionalEmailFormat, normalizeEmail } from '@/lib/validators'
import { logAudit, getClientIp } from '@/lib/audit'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const entries = await prisma.teacherWhitelistEntry.findMany({
    include: { subject: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ entries })
}

const schema = z.object({
  email: z.string(),
  subjectSlug: z.string(),
  displayName: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const email = normalizeEmail(parsed.data.email)
  if (!isInstitutionalEmailFormat(email)) {
    return NextResponse.json({ error: 'Debe ser un mail institucional (nombre.apellido@institutoverbodivino.edu.ar)' }, { status: 400 })
  }

  const subject = await prisma.subject.findUnique({ where: { slug: parsed.data.subjectSlug } })
  if (!subject) return NextResponse.json({ error: 'Materia inválida' }, { status: 400 })

  let entry
  try {
    entry = await prisma.teacherWhitelistEntry.create({
      data: { email, subjectId: subject.id, displayName: parsed.data.displayName, addedBy: admin.userId },
    })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: 'Ese mail ya está habilitado para esa materia' }, { status: 409 })
    }
    throw e
  }

  await logAudit({
    action: 'WHITELIST_PROFESOR_AGREGADO',
    actorUserId: admin.userId,
    ip: getClientIp(req),
    metadata: { email, subjectSlug: parsed.data.subjectSlug },
  })

  return NextResponse.json({ ok: true, entry })
}
