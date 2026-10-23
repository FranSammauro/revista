import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getPrimarySession } from '@/lib/session'
import { logAudit, getClientIp } from '@/lib/audit'

const schema = z.object({
  title: z.string().min(5).max(140),
  excerpt: z.string().min(10).max(280),
  content: z.string().min(50),
  subjectSlug: z.string(),
  readTime: z.number().int().min(1).max(60).optional(),
  featured: z.boolean().optional(),
})

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

// Un alumno envía un artículo. Entra directo en estado EN_REVISION —
// la materia correspondiente lo revisa antes de que se vea públicamente.
export async function POST(req: NextRequest) {
  const session = await getPrimarySession()
  if (!session || session.kind !== 'user') {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  if (user.suspendedUntil && user.suspendedUntil > new Date()) {
    return NextResponse.json({ error: 'Tu cuenta está suspendida y no podés publicar.' }, { status: 403 })
  }

  if (!user.isInstitutional) {
    return NextResponse.json({
      error: 'Solo los mails institucionales pueden publicar artículos. Con tu cuenta podés comentar.',
    }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Datos inválidos' }, { status: 400 })
  }

  const subject = await prisma.subject.findUnique({ where: { slug: parsed.data.subjectSlug } })
  if (!subject) return NextResponse.json({ error: 'Materia inválida' }, { status: 400 })

  let slug = slugify(parsed.data.title)
  const existing = await prisma.article.findUnique({ where: { slug } })
  if (existing) slug = `${slug}-${Date.now().toString(36)}`

  const article = await prisma.article.create({
    data: {
      slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content,
      coverColor: subject.color,
      readTime: parsed.data.readTime ?? 5,
      featured: false, // el "destacado" lo decide el docente al aprobar, no el autor
      status: 'EN_REVISION',
      authorId: user.id,
      subjectId: subject.id,
    },
  })

  await logAudit({
    action: 'ARTICULO_ENVIADO_REVISION',
    actorUserId: user.id,
    targetArticleId: article.id,
    ip: getClientIp(req),
    metadata: { title: article.title, subjectSlug: subject.slug },
  })

  return NextResponse.json({ ok: true, slug: article.slug, status: article.status })
}
