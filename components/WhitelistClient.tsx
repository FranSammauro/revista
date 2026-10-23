'use client'
import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'
import type { SubjectDef } from '@/lib/subjects'

interface Entry {
  id: string
  email: string
  displayName: string | null
  subject: { slug: string; label: string }
}

export default function WhitelistClient({ subjects }: { subjects: SubjectDef[] }) {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [subjectSlug, setSubjectSlug] = useState(subjects[0].slug)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/teacher-whitelist')
    const data = await res.json()
    setEntries(data.entries)
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSaving(true)
    try {
      const res = await fetch('/api/admin/teacher-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName: displayName || undefined, subjectSlug }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setEmail(''); setDisplayName('')
      load()
    } catch {
      setError('Error al agregar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('¿Quitar este mail de la whitelist?')) return
    await fetch(`/api/admin/teacher-whitelist/${id}`, { method: 'DELETE' })
    load()
  }

  const inputStyle = { padding: '9px 12px', border: '1px solid var(--ivd-gray)', borderRadius: 8, fontSize: '0.88rem' }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--ivd-black)', marginBottom: '1.5rem' }}>
        Profesores habilitados
      </h1>

      <form onSubmit={handleAdd} style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--ivd-gray)', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Mail institucional docente</label>
          <input value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="nombre.apellido@institutoverbodivino.edu.ar" style={{ ...inputStyle, width: 300 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Nombre (opcional, de referencia)</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Para identificarlo en logs" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 4 }}>Materia</label>
          <select value={subjectSlug} onChange={e => setSubjectSlug(e.target.value)} style={inputStyle}>
            {subjects.map(s => <option key={s.slug} value={s.slug}>{s.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={saving} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--ivd-red)',
          color: 'white', border: 'none', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
        }}>
          <Plus size={15} /> Agregar
        </button>
      </form>

      {error && <p style={{ color: '#C8102E', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {entries === null && <p>Cargando...</p>}
        {entries?.length === 0 && <p style={{ color: 'var(--ivd-gray-mid)' }}>Todavía no agregaste ningún profesor.</p>}
        {entries?.map(e => (
          <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderRadius: 8, padding: '0.75rem 1rem', border: '1px solid var(--ivd-gray)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.email}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ivd-gray-mid)' }}>
                {e.displayName ? `${e.displayName} · ` : ''}{e.subject.label}
              </div>
            </div>
            <button onClick={() => handleRemove(e.id)} style={{
              background: 'none', border: 'none', color: '#C8102E', cursor: 'pointer', padding: 6,
            }}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
