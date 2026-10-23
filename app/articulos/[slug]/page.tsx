import { getArticleBySlug, CATEGORIES } from '@/lib/articles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Clock, ArrowLeft, User, Calendar } from 'lucide-react'
import { getCategoryIcon } from '@/components/icons'
import ArticleActions from '@/components/ArticleActions'
import CommentsSection from '@/components/CommentsSection'
import { getPrimarySession, getSubjectSession } from '@/lib/session'

// Contenido moderado dinámicamente (estados de revisión cambian en tiempo
// real), así que no se pre-generan páginas estáticas por artículo.
export const dynamic = 'force-dynamic'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  // Solo puede borrar: el admin, o un profesor con sesión activa en la
  // materia del artículo.
  const primary = await getPrimarySession()
  const subject = await getSubjectSession()
  const isAdmin = primary?.kind === 'user' && primary.role === 'ADMIN'
  const isReviewer = subject?.subjectSlug === article.category
  const canDelete = isAdmin || isReviewer

  const cat = CATEGORIES[article.category]
  const dateStr = new Date(article.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

  const html = article.content
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[^]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .split('\n\n').map(block => {
      const t = block.trim()
      if (!t) return ''
      if (t.startsWith('<')) return t
      return `<p>${t}</p>`
    }).join('\n')

  return (
    <div style={{ paddingTop: 80 }}>
      <style>{`.back-link:hover{color:white!important}.back-link-red:hover{opacity:0.75}`}</style>

      <div style={{ background: article.coverColor, position: 'relative', overflow: 'hidden', padding: 'clamp(3rem, 8vw, 6rem) 2rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 100%)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)', opacity: 0.07, scale: '8', transformOrigin: 'center right' }}>
          {getCategoryIcon(article.category, 48, 'white')}
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Back link + category badge in same row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <Link href="/articulos" className="back-link" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: '0.85rem',
              transition: 'color 0.2s', flexShrink: 0,
            }}>
              <ArrowLeft size={14} /> Volver a artículos
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>●</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '5px 14px', borderRadius: 20,
              background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
              color: 'white', fontSize: '0.78rem', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              {getCategoryIcon(article.category, 13, 'white')} {cat?.label}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.25rem)', color: 'white', lineHeight: 1.15, marginBottom: '1.5rem' }}>
            {article.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2rem', maxWidth: 600 }}>
            {article.excerpt}
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {[
              { icon: <User size={14} />, text: article.author },
              { icon: <Calendar size={14} />, text: dateStr },
              { icon: <Clock size={14} />, text: `${article.readTime} min lectura` },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <div className="prose-ivd" dangerouslySetInnerHTML={{ __html: html }} />
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--ivd-gray)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/articulos" className="back-link-red" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'var(--ivd-red)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem',
          }}>
            <ArrowLeft size={14} /> Ver más artículos
          </Link>
          {canDelete && <ArticleActions slug={slug} />}
        </div>

        <CommentsSection slug={slug} />
      </div>
    </div>
  )
}
