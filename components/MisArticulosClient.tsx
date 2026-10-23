'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/types'
import { SUBJECTS } from '@/lib/subjects'
import { getCategoryIcon } from '@/components/icons'
import type { Article } from '@/lib/articles'
import { Send, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

const STATUS_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  EN_REVISION: { label: 'En revisión', color: '#B8860B', icon: <Clock size={14} /> },
  PUBLICADO: { label: 'Publicado', color: '#1a7a3a', icon: <CheckCircle2 size={14} /> },
  RECHAZADO: { label: 'Rechazado', color: '#C8102E', icon: <XCircle size={14} /> },
  POSPUESTO: { label: 'Pospuesto — a corregir', color: '#B8860B', icon: <AlertCircle size={14} /> },
  BORRADOR: { label: 'Borrador', color: '#888', icon: <Clock size={14} /> },
}

export default function MisArticulosClient({ articles }: { articles: Article[] }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivd-gray)', paddingTop: 100, paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--ivd-black)' }}>
            Mis artículos
          </h1>
          <Link href="/publicar" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px',
            background: 'var(--ivd-red)', color: 'white', borderRadius: 8, textDecoration: 'none',
            fontSize: '0.85rem', fontWeight: 600,
          }}>
            <Send size={14} /> Nuevo artículo
          </Link>
        </div>

        {articles.length === 0 && (
          <p style={{ color: 'var(--ivd-gray-mid)' }}>Todavía no enviaste ningún artículo.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {articles.map(a => <ArticleRow key={a.id} article={a} />)}
        </div>
      </div>
    </div>
  )
}

function ArticleRow({ article }: { article: Article }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(article.title)
  const [excerpt, setExcerpt] = useState(article.excerpt)
  const [content, setContent] = useState(article.content)
  const [subjectSlug, setSubjectSlug] = useState(article.category)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const status = STATUS_META[article.status] || STATUS_META.BORRADOR
  const cat = CATEGORIES[article.category]
  const canResubmit = article.status === 'RECHAZADO' || article.status === 'POSPUESTO'

  async function handleResubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSending(true)
    try {
      const res = await fetch(`/api/articles/${article.slug}/resubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, excerpt, content, subjectSlug }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setDone(true)
      setEditing(false)
    } catch {
      setError('Error al reenviar. Intentá de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--ivd-gray)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {getCategoryIcon(article.category, 13, cat?.color)}
            <span style={{ fontSize: '0.78rem', color: cat?.color, fontWeight: 600 }}>{cat?.label}</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ivd-black)' }}>
            {article.status === 'PUBLICADO'
              ? <a href={`/articulos/${article.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{article.title}</a>
              : article.title}
          </h3>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20,
          background: `${status.color}18`, color: status.color, fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap',
        }}>
          {status.icon} {status.label}
        </span>
      </div>

      {article.reviewComment && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--ivd-gray)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--ivd-gray-dark)' }}>
          <strong>Comentario del/la docente:</strong> {article.reviewComment}
        </div>
      )}

      {done && <p style={{ marginTop: 10, color: '#1a7a3a', fontSize: '0.85rem' }}>✅ Reenviado a revisión.</p>}

      {canResubmit && !done && (
        <div style={{ marginTop: 12 }}>
          {!editing ? (
            <button onClick={() => setEditing(true)} style={{
              padding: '8px 16px', background: 'var(--ivd-black)', color: 'white', border: 'none',
              borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            }}>
              Corregir y reenviar
            </button>
          ) : (
            <form onSubmit={handleResubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ivd-gray-mid)', marginBottom: 4 }}>
                  Materia
                </label>
                <select value={subjectSlug} onChange={e => setSubjectSlug(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--ivd-gray)', borderRadius: 8, width: '100%' }}>
                  {SUBJECTS.map(s => <option key={s.slug} value={s.slug}>{s.label}</option>)}
                </select>
              </div>
              <input value={title} onChange={e => setTitle(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid var(--ivd-gray)', borderRadius: 8 }} />
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
                style={{ padding: '8px 12px', border: '1px solid var(--ivd-gray)', borderRadius: 8, resize: 'vertical' }} />
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={10}
                style={{ padding: '8px 12px', border: '1px solid var(--ivd-gray)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: '0.85rem', resize: 'vertical' }} />
              {error && <p style={{ color: '#C8102E', fontSize: '0.82rem' }}>{error}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={sending} style={{
                  padding: '8px 16px', background: 'var(--ivd-red)', color: 'white', border: 'none',
                  borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                }}>
                  {sending ? 'Enviando...' : 'Reenviar a revisión'}
                </button>
                <button type="button" onClick={() => setEditing(false)} style={{
                  padding: '8px 16px', background: 'none', border: '1px solid var(--ivd-gray)',
                  borderRadius: 8, fontSize: '0.82rem', cursor: 'pointer',
                }}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
