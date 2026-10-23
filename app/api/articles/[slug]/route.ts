import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPrimarySession, getSubjectSession } from '@/lib/session'

// GET: detalle del artículo. Público solo si está PUBLICADO; si no, solo
// lo puede ver su autor o la materia que lo está/debería revisar.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { subject: true, author: true },
  })
  if (!article) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  if (article.status === 'PUBLICADO') return NextResponse.json(article)

  const primary = await getPrimarySession()
  const subject = await getSubjectSession()
  const isOwner = primary?.kind === 'user' && primary.userId === article.authorId
  const isReviewer = subject?.subjectSlug === article.subject.slug
  if (!isOwner && !isReviewer) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json(article)
}

// DELETE: el autor puede borrar su propio artículo mientras no esté publicado;
// la materia (revisor) puede borrar cualquier artículo de su materia.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await prisma.article.findUnique({ where: { slug }, include: { subject: true } })
  if (!article) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const primary = await getPrimarySession()
  const subject = await getSubjectSession()
  const isOwner = primary?.kind === 'user' && primary.userId === article.authorId && article.status !== 'PUBLICADO'
  const isReviewer = subject?.subjectSlug === article.subject.slug

  if (!isOwner && !isReviewer) {
    return NextResponse.json({ error: 'Sin permisos para eliminar este artículo' }, { status: 403 })
  }

  await prisma.article.delete({ where: { slug } })
  return NextResponse.json({ ok: true })
}
