import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSubjectSession } from '@/lib/session'
import { sendArticleReviewedEmail } from '@/lib/mailer'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({
  decision: z.enum(['APROBAR', 'RECHAZAR', 'POSPONER']),
  comment: z.string().max(500).optional(),
  featured: z.boolean().optional(), // solo aplica si decision = APROBAR
})

const DECISION_TO_STATUS = {
  APROBAR: 'PUBLICADO',
  RECHAZAR: 'RECHAZADO',
  POSPONER: 'POSPUESTO',
} as const

const DECISION_TO_AUDIT = {
  APROBAR: 'ARTICULO_APROBADO',
  RECHAZAR: 'ARTICULO_RECHAZADO',
  POSPONER: 'ARTICULO_POSPUESTO',
} as const

// El profesor (con sesión de materia activa) aprueba, rechaza o pospone un
// artículo EN_REVISION. "Posponer" y "rechazar" admiten un comentario para
// que el alumno sepa qué corregir antes de reenviarlo.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSubjectSession()
  if (!session) return NextResponse.json({ error: 'No hay sesión de materia activa' }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 })
  }

  if ((parsed.data.decision === 'RECHAZAR' || parsed.data.decision === 'POSPONER') && !parsed.data.comment) {
    return NextResponse.json({ error: 'Dejá un comentario explicando el motivo para el alumno.' }, { status: 400 })
  }

  const article = await prisma.article.findUnique({
    where: { id },
    include: { subject: true, author: true },
  })
  if (!article) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })
  if (article.subject.slug !== session.subjectSlug) {
    return NextResponse.json({ error: 'Este artículo no pertenece a tu materia' }, { status: 403 })
  }
  if (article.status !== 'EN_REVISION') {
    return NextResponse.json({ error: 'Este artículo ya fue revisado' }, { status: 409 })
  }

  const status = DECISION_TO_STATUS[parsed.data.decision]

  const updated = await prisma.article.update({
    where: { id },
    data: {
      status,
      reviewComment: parsed.data.comment ?? null,
      reviewedBy: session.username,
      reviewedAt: new Date(),
      publishedAt: status === 'PUBLICADO' ? new Date() : null,
      featured: status === 'PUBLICADO' ? !!parsed.data.featured : false,
    },
  })

  await sendArticleReviewedEmail(
    article.author.email,
    article.author.displayName,
    article.title,
    status as 'PUBLICADO' | 'RECHAZADO' | 'POSPUESTO',
    parsed.data.comment
  )

  await logAudit({
    action: DECISION_TO_AUDIT[parsed.data.decision],
    actorTeacherIdentityId: session.actingTeacherIdentityId,
    actingAsSubjectUsername: session.username,
    targetArticleId: article.id,
    targetUserId: article.authorId,
    ip: getClientIp(req),
    metadata: { comment: parsed.data.comment },
  })

  return NextResponse.json({ ok: true, status: updated.status })
}
