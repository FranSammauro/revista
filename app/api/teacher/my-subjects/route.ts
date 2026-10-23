import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPrimarySession } from '@/lib/session'

// Lista las materias a las que el profesor logueado (sesión personal) puede
// pedir acceso temporal — solo aparecen si su mail está en la whitelist.
export async function GET() {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'teacher') {
    return NextResponse.json({ error: 'No autenticado como docente' }, { status: 401 })
  }

  const entries = await prisma.teacherWhitelistEntry.findMany({
    where: { email: session.email },
    include: { subject: true },
  })

  return NextResponse.json({
    subjects: entries.map(e => ({ slug: e.subject.slug, label: e.subject.label })),
  })
}
