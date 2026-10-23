import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPrimarySession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({
  title: z.string().min(5).max(140).optional(),
  excerpt: z.string().min(10).max(280).optional(),
  content: z.string().min(50).optional(),
  subjectSlug: z.string().optional(), // permite corregir si lo rechazaron por ser la materia equivocada
})

// El alumno corrige y reenvía un artículo RECHAZADO o POSPUESTO.
// Vuelve a entrar en EN_REVISION, limpiando el comentario anterior.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'user') {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { slug } = await params
  const article = await prisma.article.findUnique({ where: { slug } })
  if (!article || article.authorId !== session.userId) {
    return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })
  }
  if (article.status !== 'RECHAZADO' && article.status !== 'POSPUESTO') {
    return NextResponse.json({ error: 'Este artículo no se puede reenviar en su estado actual' }, { status: 409 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  let subjectId = article.subjectId
  let coverColor = article.coverColor
  if (parsed.data.subjectSlug) {
    const subject = await prisma.subject.findUnique({ where: { slug: parsed.data.subjectSlug } })
    if (!subject) return NextResponse.json({ error: 'Materia inválida' }, { status: 400 })
    subjectId = subject.id
    coverColor = subject.color
  }

  const updated = await prisma.article.update({
    where: { id: article.id },
    data: {
      title: parsed.data.title ?? article.title,
      excerpt: parsed.data.excerpt ?? article.excerpt,
      content: parsed.data.content ?? article.content,
      subjectId,
      coverColor,
      status: 'EN_REVISION',
      reviewComment: null,
      reviewedBy: null,
      reviewedAt: null,
    },
  })

  await logAudit({
    action: 'ARTICULO_ENVIADO_REVISION',
    actorUserId: session.userId,
    targetArticleId: article.id,
    ip: getClientIp(req),
    metadata: { reenvio: true },
  })

  return NextResponse.json({ ok: true, status: updated.status })
}
