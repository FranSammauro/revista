'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Eye, EyeOff, GraduationCap, Users } from 'lucide-react'

type Tab = 'alumno' | 'docente'

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

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('alumno')

  // --- Alumno ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // --- Docente ---
  const [teacherEmail, setTeacherEmail] = useState('')
  const [teacherCode, setTeacherCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleStudentSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push(data.user?.role === 'ADMIN' ? '/admin' : '/')
      router.refresh()
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setMessage(''); setLoading(true)
    try {
      const res = await fetch('/api/teacher/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: teacherEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setCodeSent(true)
      setMessage(data.message)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/teacher/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: teacherEmail, code: teacherCode }),
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

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ivd-black)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(200,16,46,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.06) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,16,46,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 440,
        backdropFilter: 'blur(12px)', position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <img src="/escudo-ivd.png" alt="IVD" width={56} height={56} style={{ objectFit: 'contain', display: 'block' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: 'white', marginBottom: '0.35rem' }}>
            Ingresar a Revista IVD
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.75rem', background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 10 }}>
          {([
            { id: 'alumno' as Tab, label: 'Alumno', icon: <GraduationCap size={15} /> },
            { id: 'docente' as Tab, label: 'Docente', icon: <Users size={15} /> },
          ]).map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setError(''); setMessage('') }}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                background: tab === t.id ? 'var(--ivd-red)' : 'transparent',
                color: tab === t.id ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.2s',
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'alumno' && (
          <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={fieldLabel}>Mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                autoComplete="email" style={fieldInput} />
            </div>
            <div>
              <label style={fieldLabel}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password" style={{ ...fieldInput, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <ErrorBox>{error}</ErrorBox>}

            <SubmitButton loading={loading} label="Ingresar" />

            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
              ¿No tenés cuenta? <Link href="/registro" style={{ color: 'var(--ivd-red)' }}>Creá una</Link>
            </p>
          </form>
        )}

        {tab === 'docente' && !codeSent && (
          <form onSubmit={handleRequestCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={fieldLabel}>Mail institucional docente</label>
              <input type="email" value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)}
                placeholder="nombre.apellido@institutoverbodivino.edu.ar" required style={fieldInput} />
            </div>
            {error && <ErrorBox>{error}</ErrorBox>}
            <SubmitButton loading={loading} label="Enviar código" />
          </form>
        )}

        {tab === 'docente' && codeSent && (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {message && <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: '0.83rem' }}>{message}</div>}
            <div>
              <label style={fieldLabel}>Código recibido por mail</label>
              <input value={teacherCode} onChange={e => setTeacherCode(e.target.value)} maxLength={6}
                placeholder="123456" required style={{ ...fieldInput, textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.1rem' }} />
            </div>
            {error && <ErrorBox>{error}</ErrorBox>}
            <SubmitButton loading={loading} label="Verificar e ingresar" />
            <button type="button" onClick={() => setCodeSent(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
              Usar otro mail
            </button>
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

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} style={{
      padding: '13px', background: loading ? 'rgba(200,16,46,0.5)' : 'var(--ivd-red)',
      color: 'white', border: 'none', borderRadius: 10, fontWeight: 700,
      fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      fontFamily: 'var(--font-body)',
    }}>
      <LogIn size={18} />
      {loading ? 'Procesando...' : label}
    </button>
  )
}
