import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPrimarySession, getSubjectSession } from '@/lib/session'

// GET: hilo completo de comentarios de un artículo. Los moderadores
// (admin o cualquier materia con sesión activa) ven el texto de los
// comentarios censurados; los demas solo ven el placeholder.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { id: true, status: true, authorId: true, subject: { select: { slug: true } } },
  })
  if (!article) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const primary = await getPrimarySession()
  const subject = await getSubjectSession()
  const isAdmin = primary?.kind === 'user' && primary.role === 'ADMIN'
  const isReviewer = subject?.subjectSlug === article.subject.slug
  const isModerator = isAdmin || isReviewer

  // Un artículo que todavía no está publicado no debería revelar su
  // existencia (ni su hilo de comentarios, que de todos modos va a estar
  // vacío) a nadie que no sea su autor o quien lo esté/deba revisar.
  if (article.status !== 'PUBLICADO') {
    const isOwner = primary?.kind === 'user' && primary.userId === article.authorId
    if (!isOwner && !isModerator) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  const comments = await prisma.comment.findMany({
    where: { articleId: article.id },
    include: { author: { select: { id: true, displayName: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const shaped = comments.map(c => ({
    id: c.id,
    parentCommentId: c.parentCommentId,
    createdAt: c.createdAt,
    author: c.isDeleted ? null : c.author,
    body: c.isDeleted ? '[comentario eliminado]' : (c.isCensored && !isModerator ? '[comentario moderado]' : c.body),
    isCensored: c.isCensored,
    isDeleted: c.isDeleted,
    isOwn: primary?.kind === 'user' && primary.userId === c.authorId,
  }))

  return NextResponse.json({ comments: shaped, isModerator })
}

const schema = z.object({
  body: z.string().min(1).max(2000),
  parentCommentId: z.string().optional(),
})

// POST: un usuario autenticado (alumno institucional o personal) comenta
// o responde un hilo. No hace falta ser institucional para comentar.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'user') {
    return NextResponse.json({ error: 'Tenés que iniciar sesión para comentar' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  if (user.suspendedUntil && user.suspendedUntil > new Date()) {
    return NextResponse.json({
      error: `Tu cuenta está suspendida hasta el ${user.suspendedUntil.toLocaleDateString('es-AR')} y no podés comentar.`,
    }, { status: 403 })
  }

  const { slug } = await params
  const article = await prisma.article.findUnique({ where: { slug } })
  if (!article || article.status !== 'PUBLICADO') {
    return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  if (parsed.data.parentCommentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parsed.data.parentCommentId } })
    if (!parent || parent.articleId !== article.id) {
      return NextResponse.json({ error: 'El comentario al que respondés no existe' }, { status: 400 })
    }
  }

  const comment = await prisma.comment.create({
    data: {
      articleId: article.id,
      authorId: user.id,
      body: parsed.data.body,
      parentCommentId: parsed.data.parentCommentId,
    },
    include: { author: { select: { id: true, displayName: true } } },
  })

  return NextResponse.json({ ok: true, comment })
}
