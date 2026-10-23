'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ShieldCheck } from 'lucide-react'

function ConfirmarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [subjectLabel, setSubjectLabel] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!token) { setError('Falta el token de acceso.'); return }
    fetch(`/api/teacher/consume-access?token=${token}`).then(async r => {
      const data = await r.json()
      if (!r.ok) { setError(data.error); return }
      setSubjectLabel(data.subjectLabel)
    })
  }, [token])

  async function handleConfirm() {
    setConfirming(true); setError('')
    try {
      const res = await fetch('/api/teacher/consume-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(data.redirectTo)
      router.refresh()
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivd-black)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 420, textAlign: 'center',
      }}>
        <ShieldCheck size={36} color="var(--ivd-red)" style={{ marginBottom: '1rem' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', color: 'white', marginBottom: '0.75rem' }}>
          {error ? 'No se pudo confirmar el acceso' : subjectLabel ? `Entrar a ${subjectLabel}` : 'Verificando link...'}
        </h1>

        {error && <p style={{ color: '#ff6b6b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>{error}</p>}

        {!error && subjectLabel && (
          <>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Por seguridad, confirmá manualmente que querés entrar a esta cuenta. Este link es de un solo uso.
            </p>
            <button onClick={handleConfirm} disabled={confirming} style={{
              width: '100%', padding: '13px', background: confirming ? 'rgba(200,16,46,0.5)' : 'var(--ivd-red)',
              color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.95rem',
              cursor: confirming ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
            }}>
              {confirming ? 'Ingresando...' : 'Confirmar e ingresar'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ConfirmarAccesoPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmarContent />
    </Suspense>
  )
}
