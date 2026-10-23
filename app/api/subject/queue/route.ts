import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSubjectSession } from '@/lib/session'

// Cola de artículos pendientes de revisión de la materia activa.
export async function GET() {
  const session = await getSubjectSession()
  if (!session) return NextResponse.json({ error: 'No hay sesión de materia activa' }, { status: 401 })

  const subject = await prisma.subject.findUnique({ where: { slug: session.subjectSlug } })
  if (!subject) return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 })

  const [pending, history] = await Promise.all([
    prisma.article.findMany({
      where: { subjectId: subject.id, status: 'EN_REVISION' },
      include: { author: { select: { displayName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.article.findMany({
      where: { subjectId: subject.id, status: { in: ['PUBLICADO', 'RECHAZADO', 'POSPUESTO'] } },
      include: { author: { select: { displayName: true, email: true } } },
      orderBy: { reviewedAt: 'desc' },
      take: 30,
    }),
  ])

  return NextResponse.json({ pending, history })
}
