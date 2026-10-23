'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevaContrasenaPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [hasCurrent, setHasCurrent] = useState(false) // asumimos primer seteo; se puede ajustar si el fetch /me lo indica
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/teacher/subject-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: hasCurrent ? currentPassword : undefined, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/panel-materia')
      router.refresh()
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const fieldInput = {
    width: '100%', padding: '12px 16px', border: '1px solid var(--ivd-gray)',
    borderRadius: 10, outline: 'none', fontFamily: 'var(--font-body)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivd-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--ivd-black)' }}>
          Definí la contraseña de la materia
        </h1>
        <p style={{ color: 'var(--ivd-gray-mid)', fontSize: '0.85rem' }}>
          Es la primera vez que alguien entra a esta cuenta. A partir de ahora, cualquier docente habilitado puede pedir un nuevo link de acceso o, si preferís, podés dejar esta contraseña para entrar directo la próxima vez.
        </p>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <input type="checkbox" checked={hasCurrent} onChange={e => setHasCurrent(e.target.checked)} />
          Ya hay una contraseña anterior que quiero cambiar
        </label>

        {hasCurrent && (
          <input type="password" placeholder="Contraseña actual" value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)} style={fieldInput} required />
        )}

        <input type="password" placeholder="Nueva contraseña (mín. 8 caracteres)" value={newPassword}
          onChange={e => setNewPassword(e.target.value)} minLength={8} style={fieldInput} required />

        {error && <p style={{ color: '#C8102E', fontSize: '0.85rem' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{
          padding: '13px', background: 'var(--ivd-red)', color: 'white', border: 'none',
          borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
        }}>
          {loading ? 'Guardando...' : 'Guardar y continuar'}
        </button>
      </form>
    </div>
  )
}
