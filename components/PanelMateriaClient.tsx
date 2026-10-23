'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, CheckCircle2, XCircle, Clock3, Star } from 'lucide-react'

interface QueueArticle {
  id: string
  title: string
  excerpt: string
  content: string
  readTime: number
  createdAt: string
  author: { displayName: string; email: string }
}

interface HistoryArticle extends QueueArticle {
  status: string
  reviewComment: string | null
  reviewedAt: string | null
}

export default function PanelMateriaClient({ subjectLabel, username }: { subjectLabel: string; username: string }) {
  const router = useRouter()
  const [pending, setPending] = useState<QueueArticle[]>([])
  const [history, setHistory] = useState<HistoryArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/subject/queue')
    if (res.ok) {
      const data = await res.json()
      setPending(data.pending)
      setHistory(data.history)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleLogout() {
    await fetch('/api/teacher/subject-logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  async function decide(id: string, decision: 'APROBAR' | 'RECHAZAR' | 'POSPONER', comment?: string, featured?: boolean) {
    const res = await fetch(`/api/subject/articles/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, comment, featured }),
    })
    if (res.ok) { setOpenId(null); load() } else {
      const data = await res.json()
      alert(data.error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivd-gray)', paddingTop: 80 }}>
      <div style={{ background: 'var(--ivd-black)', borderBottom: '1px solid rgba(200,16,46,0.2)', padding: '1rem 1.25rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: '1rem' }}>
              Revista<span style={{ color: 'var(--ivd-red)' }}>IVD</span> · Panel de {subjectLabel}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>Cuenta: {username}</div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 5, background: 'none',
            border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
            borderRadius: 8, padding: '7px 13px', cursor: 'pointer', fontSize: '0.82rem',
          }}>
            <LogOut size={14} /> Salir de la materia
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1.25rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--ivd-black)' }}>
          Pendientes de revisión {pending.length > 0 && `(${pending.length})`}
        </h2>

        {loading && <p>Cargando...</p>}
        {!loading && pending.length === 0 && <p style={{ color: 'var(--ivd-gray-mid)' }}>No hay artículos pendientes. 🎉</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          {pending.map(a => (
            <div key={a.id} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--ivd-gray)', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>{a.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ivd-gray-mid)' }}>Por {a.author.displayName} ({a.author.email})</p>
                </div>
                <button onClick={() => setOpenId(openId === a.id ? null : a.id)} style={{
                  padding: '6px 14px', border: '1px solid var(--ivd-gray)', borderRadius: 8, background: 'none',
                  fontSize: '0.8rem', cursor: 'pointer', height: 'fit-content',
                }}>
                  {openId === a.id ? 'Ocultar' : 'Ver completo'}
                </button>
              </div>
              <p style={{ marginTop: 8, color: 'var(--ivd-gray-dark)', fontSize: '0.9rem' }}>{a.excerpt}</p>

              {openId === a.id && (
                <div style={{ marginTop: 12, padding: '12px', background: 'var(--ivd-gray)', borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: '0.85rem', maxHeight: 320, overflowY: 'auto' }}>
                  {a.content}
                </div>
              )}

              <ReviewActions onDecide={(decision, comment, featured) => decide(a.id, decision, comment, featured)} />
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--ivd-black)' }}>
          Historial reciente
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {history.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.75rem 1rem', background: 'white', borderRadius: 8, fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <span>{a.title} — {a.author.displayName}</span>
              <StatusTag status={a.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusTag({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    PUBLICADO: { color: '#1a7a3a', label: 'Publicado' },
    RECHAZADO: { color: '#C8102E', label: 'Rechazado' },
    POSPUESTO: { color: '#B8860B', label: 'Pospuesto' },
  }
  const m = map[status] || { color: '#888', label: status }
  return <span style={{ color: m.color, fontWeight: 700 }}>{m.label}</span>
}

function ReviewActions({ onDecide }: { onDecide: (decision: 'APROBAR' | 'RECHAZAR' | 'POSPONER', comment?: string, featured?: boolean) => void }) {
  const [mode, setMode] = useState<'RECHAZAR' | 'POSPONER' | null>(null)
  const [comment, setComment] = useState('')
  const [featured, setFeatured] = useState(false)

  if (mode) {
    return (
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
          placeholder={`Explicale al alumno por qué lo ${mode === 'RECHAZAR' ? 'rechazás' : 'posponés'}...`}
          style={{ padding: '8px 12px', border: '1px solid var(--ivd-gray)', borderRadius: 8, resize: 'vertical' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => comment.trim() && onDecide(mode, comment)} disabled={!comment.trim()} style={{
            padding: '7px 14px', background: 'var(--ivd-black)', color: 'white', border: 'none',
            borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer',
          }}>
            Confirmar {mode === 'RECHAZAR' ? 'rechazo' : 'posposición'}
          </button>
          <button onClick={() => setMode(null)} style={{ padding: '7px 14px', background: 'none', border: '1px solid var(--ivd-gray)', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--ivd-gray-dark)' }}>
        <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
        <Star size={13} /> Destacar al aprobar
      </label>
      <button onClick={() => onDecide('APROBAR', undefined, featured)} style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#1a7a3a', color: 'white',
        border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
      }}>
        <CheckCircle2 size={14} /> Aprobar
      </button>
      <button onClick={() => setMode('POSPONER')} style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'none', color: '#B8860B',
        border: '1px solid #B8860B', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
      }}>
        <Clock3 size={14} /> Posponer
      </button>
      <button onClick={() => setMode('RECHAZAR')} style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'none', color: '#C8102E',
        border: '1px solid #C8102E', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
      }}>
        <XCircle size={14} /> Rechazar
      </button>
    </div>
  )
}
