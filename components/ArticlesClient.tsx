'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ArticleCard from '@/components/ArticleCard'
import { CATEGORIES } from '@/lib/types'
import { getCategoryIcon } from '@/components/icons'
import type { ArticleMeta } from '@/lib/types'
import { Search } from 'lucide-react'

function ArticlesContent({ initialArticles }: { initialArticles: ArticleMeta[] }) {
  const searchParams = useSearchParams()
  const catParam = searchParams.get('cat')
  const [activeCategory, setActiveCategory] = useState<string | null>(catParam)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setActiveCategory(catParam)
  }, [catParam])

  const filtered = initialArticles
    .filter(a => !activeCategory || a.category === activeCategory)
    .filter(a =>
      !query ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(query.toLowerCase())
    )

  return (
    <div style={{ paddingTop: 100, minHeight: '100vh' }}>
      {/* Page header */}
      <div style={{ background: 'var(--ivd-black)', padding: '4rem 2rem 3rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ivd-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            RevistaIVD
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'white', margin: '0.5rem 0 1rem' }}>
            {activeCategory ? CATEGORIES[activeCategory]?.label : 'Todos los artículos'}
          </h1>
          <div style={{ position: 'relative', maxWidth: 480 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar artículos..."
              style={{
                width: '100%', padding: '12px 16px 12px 42px',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8, color: 'white', fontSize: '0.9rem',
                outline: 'none', fontFamily: 'var(--font-body)',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              padding: '8px 18px', borderRadius: 20, border: '1px solid',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'var(--font-body)',
              background: !activeCategory ? 'var(--ivd-red)' : 'transparent',
              color: !activeCategory ? 'white' : 'var(--ivd-gray-dark)',
              borderColor: !activeCategory ? 'var(--ivd-red)' : 'var(--ivd-gray)',
            }}
          >Todos</button>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key === activeCategory ? null : key)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: '1px solid',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: 'var(--font-body)',
                background: activeCategory === key ? cat.color : 'transparent',
                color: activeCategory === key ? 'white' : 'var(--ivd-gray-dark)',
                borderColor: activeCategory === key ? cat.color : 'var(--ivd-gray)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {getCategoryIcon(key, 13, activeCategory === key ? 'white' : cat.color)}
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--ivd-gray-mid)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>No se encontraron artículos</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.5rem' }}>
            {filtered.map(article => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ArticlesClient({ initialArticles }: { initialArticles: ArticleMeta[] }) {
  return (
    <Suspense>
      <ArticlesContent initialArticles={initialArticles} />
    </Suspense>
  )
}
