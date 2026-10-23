import 'server-only'
import { prisma } from './prisma'
import type { ArticleMeta } from './types'

export { CATEGORIES } from './subjects'
export type { ArticleMeta } from './types'

export interface Article extends ArticleMeta {
  content: string
  reviewComment: string | null
}

// Solo artículos PUBLICADOS son visibles para cualquier visitante.
export async function getAllArticles(): Promise<ArticleMeta[]> {
  const rows = await prisma.article.findMany({
    where: { status: 'PUBLICADO' },
    include: { subject: true, author: true },
    orderBy: { publishedAt: 'desc' },
  })
  return rows.map(toMeta)
}

export async function getFeaturedArticles(): Promise<ArticleMeta[]> {
  const rows = await prisma.article.findMany({
    where: { status: 'PUBLICADO', featured: true },
    include: { subject: true, author: true },
    orderBy: { publishedAt: 'desc' },
  })
  return rows.map(toMeta)
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const row = await prisma.article.findUnique({
    where: { slug },
    include: { subject: true, author: true },
  })
  if (!row || row.status !== 'PUBLICADO') return null
  return { ...toMeta(row), content: row.content, reviewComment: row.reviewComment }
}

/** Artículos propios del usuario logueado, en cualquier estado (para "Mis artículos"). */
export async function getOwnArticles(authorId: string): Promise<Article[]> {
  const rows = await prisma.article.findMany({
    where: { authorId },
    include: { subject: true, author: true },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map(r => ({ ...toMeta(r), content: r.content, reviewComment: r.reviewComment }))
}

function toMeta(row: {
  id: string; title: string; slug: string; excerpt: string; readTime: number
  featured: boolean; coverColor: string; status: string; publishedAt: Date | null; createdAt: Date
  subject: { slug: string }; author: { displayName: string }
}): ArticleMeta {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    category: row.subject.slug,
    author: row.author.displayName,
    date: (row.publishedAt ?? row.createdAt).toISOString().split('T')[0],
    readTime: row.readTime,
    featured: row.featured,
    coverColor: row.coverColor,
    status: row.status,
  }
}
