'use client'
import { useEffect, useState } from 'react'
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react'

interface UserRow {
  id: string
  email: string
  displayName: string
  role: string
  isInstitutional: boolean
  emailVerified: boolean
  suspendedUntil: string | null
  suspendReason: string | null
}

export default function UsuariosClient() {
  const [q, setQ] = useState('')
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  async function load(query = '') {
    setLoading(true)
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`)
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function suspend(id: string, days: number) {
    let reason: string | undefined
    if (days > 0) {
      reason = prompt('Motivo de la suspensión:') || undefined
      if (!reason) return
    }
    setActing(id)
    await fetch(`/api/admin/users/${id}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days, reason }),
    })
    setActing(null)
    load(q)
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: 'var(--ivd-black)', marginBottom: '1.5rem' }}>
        Usuarios
      </h1>

      <form onSubmit={e => { e.preventDefault(); load(q) }} style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por mail o nombre..."
          style={{ flex: 1, maxWidth: 360, padding: '9px 12px', border: '1px solid var(--ivd-gray)', borderRadius: 8 }} />
        <button type="submit" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--ivd-black)',
          color: 'white', border: 'none', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer',
        }}>
          <Search size={15} /> Buscar
        </button>
      </form>

      {loading && <p>Cargando...</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {users.map(u => {
          const isSuspended = u.suspendedUntil && new Date(u.suspendedUntil) > new Date()
          return (
            <div key={u.id} style={{ background: 'white', borderRadius: 10, padding: '0.9rem 1.1rem', border: '1px solid var(--ivd-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {u.displayName} <span style={{ fontWeight: 400, color: 'var(--ivd-gray-mid)' }}>· {u.email}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--ivd-gray-mid)', display: 'flex', gap: 8, marginTop: 2 }}>
                  <span>{u.role}</span>
                  <span>·</span>
                  <span>{u.isInstitutional ? 'Institucional (puede publicar)' : 'Mail personal (solo comenta)'}</span>
                  {isSuspended && <><span>·</span><span style={{ color: '#C8102E', fontWeight: 700 }}>Suspendido hasta {new Date(u.suspendedUntil!).toLocaleDateString('es-AR')}</span></>}
                </div>
                {isSuspended && u.suspendReason && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--ivd-gray-mid)', marginTop: 2 }}>Motivo: {u.suspendReason}</div>
                )}
              </div>
              {u.role !== 'ADMIN' && (
                isSuspended ? (
                  <button onClick={() => suspend(u.id, 0)} disabled={acting === u.id} style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#1a7a3a',
                    color: 'white', border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                  }}>
                    <ShieldCheck size={14} /> Reactivar
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[3, 7, 30].map(d => (
                      <button key={d} onClick={() => suspend(u.id, d)} disabled={acting === u.id} style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', background: 'none',
                        border: '1px solid #C8102E', color: '#C8102E', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                      }}>
                        <ShieldAlert size={13} /> {d}d
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
