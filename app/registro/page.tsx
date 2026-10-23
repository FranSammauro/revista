'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserPlus } from 'lucide-react'

const fieldLabel = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
  letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.5rem',
}
const fieldInput = {
  width: '100%', padding: '12px 16px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 10, color: 'white', fontSize: '0.95rem',
  outline: 'none', fontFamily: 'var(--font-body)',
}

const INSTITUTIONAL_HINT = /^[a-záéíóúñü]+(-[a-záéíóúñü]+)*\.[a-záéíóúñü]+(-[a-záéíóúñü]+)*@institutoverbodivino\.edu\.ar$/i

export default function RegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'verificar'>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const isInstitutional = INSTITUTIONAL_HINT.test(email.trim())

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName: isInstitutional ? undefined : displayName }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setInfo(data.message)
      setStep('verificar')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/login')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ivd-black)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 440,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: 'white', marginBottom: '0.35rem' }}>
            {step === 'form' ? 'Crear cuenta' : 'Verificá tu mail'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)' }}>
            {step === 'form'
              ? 'Con tu mail institucional podés publicar artículos. Con cualquier otro mail podés comentar.'
              : `Te mandamos un código a ${email}`}
          </p>
        </div>

        {step === 'form' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={fieldLabel}>Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={fieldInput}
                placeholder="apellido.nombre@institutoverbodivino.edu.ar" />
              {email && (
                <p style={{ fontSize: '0.75rem', marginTop: 6, color: isInstitutional ? '#6bdc8f' : 'rgba(255,255,255,0.4)' }}>
                  {isInstitutional ? '✓ Mail institucional — vas a poder publicar artículos' : 'Mail personal — vas a poder comentar, pero no publicar'}
                </p>
              )}
            </div>

            {!isInstitutional && email && (
              <div>
                <label style={fieldLabel}>Nombre para mostrar</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} required
                  maxLength={60} style={fieldInput} placeholder="Como vas a aparecer en tus comentarios" />
              </div>
            )}

            <div>
              <label style={fieldLabel}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                minLength={8} autoComplete="new-password" style={fieldInput} />
            </div>

            {error && <ErrorBox>{error}</ErrorBox>}
            <SubmitButton loading={loading} label="Crear cuenta" icon={<UserPlus size={18} />} />

            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
              ¿Ya tenés cuenta? <Link href="/login" style={{ color: 'var(--ivd-red)' }}>Ingresá</Link>
            </p>
          </form>
        )}

        {step === 'verificar' && (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {info && <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: '0.83rem' }}>{info}</div>}
            <div>
              <label style={fieldLabel}>Código de verificación</label>
              <input value={code} onChange={e => setCode(e.target.value)} maxLength={6} required
                placeholder="123456" style={{ ...fieldInput, textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.1rem' }} />
            </div>
            {error && <ErrorBox>{error}</ErrorBox>}
            <SubmitButton loading={loading} label="Verificar cuenta" icon={<UserPlus size={18} />} />
          </form>
        )}
      </div>
    </div>
  )
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '10px 14px', background: 'rgba(200,16,46,0.15)', border: '1px solid rgba(200,16,46,0.4)', borderRadius: 8, color: '#ff6b6b', fontSize: '0.85rem' }}>
      {children}
    </div>
  )
}

function SubmitButton({ loading, label, icon }: { loading: boolean; label: string; icon: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading} style={{
      padding: '13px', background: loading ? 'rgba(200,16,46,0.5)' : 'var(--ivd-red)',
      color: 'white', border: 'none', borderRadius: 10, fontWeight: 700,
      fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      fontFamily: 'var(--font-body)',
    }}>
      {icon}
      {loading ? 'Procesando...' : label}
    </button>
  )
}
