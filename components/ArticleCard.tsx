"use client"
import Link from 'next/link'
import { ArticleMeta, CATEGORIES } from '@/lib/types'
import { Clock, ArrowUpRight } from 'lucide-react'
import { getCategoryIcon } from '@/components/icons'

interface Props {
  article: ArticleMeta
  variant?: 'default' | 'featured' | 'compact'
}

export default function ArticleCard({ article, variant = 'default' }: Props) {
  const cat = CATEGORIES[article.category]
  const dateStr = new Date(article.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  const icon = getCategoryIcon(article.category, 20, 'currentColor')

  if (variant === 'featured') {
    return (
      <Link href={`/articulos/${article.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <article style={{
          position: 'relative', overflow: 'hidden', borderRadius: 16,
          background: article.coverColor,
          minHeight: 420, padding: '2.5rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(-4px)'
            el.style.boxShadow = '0 20px 48px rgba(0,0,0,0.2)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'translateY(0)'
            el.style.boxShadow = 'none'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
          {/* Decorative icon background */}
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', opacity: 0.1, color: 'white', transform: 'scale(4)', transformOrigin: 'top right' }}>
            {getCategoryIcon(article.category, 24, 'white')}
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', fontSize: '0.75rem', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem',
              backdropFilter: 'blur(4px)',
            }}>
              <span style={{ color: 'white' }}>{getCategoryIcon(article.category, 13, 'white')}</span>
              {cat?.label}
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              {article.title}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: 480 }}>
              {article.excerpt}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{article.author}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem' }}>
                  <Clock size={12} /> {article.readTime} min
                </span>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowUpRight size={18} color={article.coverColor} />
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={`/articulos/${article.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <article style={{
          display: 'flex', gap: '1rem', padding: '1.25rem 0',
          borderBottom: '1px solid var(--ivd-gray)',
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 10, flexShrink: 0,
            background: article.coverColor + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: cat?.color,
          }}>
            {getCategoryIcon(article.category, 22, cat?.color)}
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: cat?.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cat?.label}</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ivd-black)', lineHeight: 1.3, marginTop: 2 }}>
              {article.title}
            </h3>
          </div>
        </article>
      </Link>
    )
  }

  // Default card
  return (
    <Link href={`/articulos/${article.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article style={{
        borderRadius: 12, overflow: 'hidden',
        border: '1px solid var(--ivd-gray)',
        background: 'white', transition: 'all 0.3s ease', cursor: 'pointer',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'translateY(-4px)'
          el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.09)'
          el.style.borderColor = article.coverColor + '80'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = 'none'
          el.style.borderColor = 'var(--ivd-gray)'
        }}
      >
        <div style={{ height: 6, background: article.coverColor }} />
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: '0.73rem', fontWeight: 700, color: cat?.color,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {getCategoryIcon(article.category, 13, cat?.color)}
              {cat?.label}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ivd-gray-mid)' }}>{dateStr}</span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ivd-black)', lineHeight: 1.3, marginBottom: '0.6rem' }}>
            {article.title}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--ivd-gray-mid)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {article.excerpt}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--ivd-gray-dark)', fontWeight: 500 }}>{article.author}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--ivd-gray-mid)' }}>
              <Clock size={12} /> {article.readTime} min
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
