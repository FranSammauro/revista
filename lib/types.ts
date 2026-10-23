// Fuente única de verdad para los tipos de artículo usados tanto en el
// cliente (componentes 'use client') como en el servidor (lib/articles.ts).
// No importa nada de Prisma ni 'server-only' a propósito, para que los
// componentes cliente puedan importar estos tipos sin arrastrar código de
// servidor.
export { CATEGORIES } from './subjects'

export interface ArticleMeta {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  author: string
  date: string
  readTime: number
  featured: boolean
  coverColor: string
  status: string
}
