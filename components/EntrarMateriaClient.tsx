'use client'
import { useEffect, useState } from 'react'
import { getCategoryIcon } from '@/components/icons'
import { SUBJECTS } from '@/lib/subjects'
import { Mail } from 'lucide-react'

export default function EntrarMateriaClient() {
  const [subjects, setSubjects] = useState<{ slug: string; label: string }[] | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/teacher/my-subjects').then(r => r.json()).then(d => setSubjects(d.subjects || []))
  }, [])

  async function requestAccess(slug: string) {
    setError(''); setSentTo(null)
    const res = await fetch('/api/teacher/request-subject-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectSlug: slug }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); return }
    setSentTo(slug)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivd-gray)', paddingTop: 100, paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 1.25rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', color: 'var(--ivd-black)', marginBottom: '0.5rem' }}>
          Entrar a una materia
        </h1>
        <p style={{ color: 'var(--ivd-gray-mid)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Elegí la materia. Te vamos a mandar un link de acceso de un solo uso a tu mail institucional.
        </p>

        {subjects === null && <p>Cargando...</p>}
        {subjects?.length === 0 && <p>Tu mail no está habilitado para ninguna materia todavía. Pedile al administrador que te agregue.</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {subjects?.map(s => {
            const def = SUBJECTS.find(x => x.slug === s.slug)
            return (
              <div key={s.slug} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'white', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid var(--ivd-gray)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {getCategoryIcon(s.slug, 18, def?.color)}
                  <span style={{ fontWeight: 700, color: 'var(--ivd-black)' }}>{s.label}</span>
                </div>
                {sentTo === s.slug ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1a7a3a', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Mail size={14} /> Revisá tu mail
                  </span>
                ) : (
                  <button onClick={() => requestAccess(s.slug)} style={{
                    padding: '8px 16px', background: 'var(--ivd-red)', color: 'white', border: 'none',
                    borderRadius: 8, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                  }}>
                    Pedir acceso
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {error && <p style={{ color: '#C8102E', marginTop: '1rem', fontSize: '0.85rem' }}>{error}</p>}
      </div>
    </div>
  )
}
