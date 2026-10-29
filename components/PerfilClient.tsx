'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User as UserIcon, AtSign, Upload, Trash2, LogOut, Save } from 'lucide-react'

interface Profile {
  displayName: string
  email: string
  role: string
  kind?: 'user' | 'teacher'
  isInstitutional: boolean
  avatarUrl: string | null
  bio: string | null
  instagramHandle: string | null
  avatarRemovedAt: string | null
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  PROFESOR: 'Profesor/a',
  ALUMNO: 'Alumno/a',
}

export default function PerfilClient() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bio, setBio] = useState('')
  const [instagram, setInstagram] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function load() {
    const res = await fetch('/api/profile')
    if (res.ok) {
      const data = await res.json()
      setProfile(data.user)
      setBio(data.user.bio || '')
      setInstagram(data.user.instagramHandle || '')
    }
  }

  useEffect(() => { load() }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSaved(false); setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, instagramHandle: instagram }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setSaved(true)
      load()
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      load()
    } catch {
      setError('Error al subir la imagen. Intentá de nuevo.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemoveAvatar() {
    setUploading(true)
    await fetch('/api/profile/avatar', { method: 'DELETE' })
    setUploading(false)
    load()
  }

  async function handleLogout() {
    // Cerramos la sesión personal y, por las dudas, también la de materia
    // (si el que cierra sesión es un profesor con una cuenta de materia
    // activa, no queremos que le quede esa cookie colgada).
    await Promise.all([
      fetch('/api/auth/logout', { method: 'POST' }),
      fetch('/api/teacher/subject-logout', { method: 'POST' }),
    ])
    router.push('/')
    router.refresh()
  }

  if (!profile) return <div style={{ minHeight: '100vh', paddingTop: 100 }} />

  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid var(--ivd-gray)',
    borderRadius: 8, outline: 'none', fontFamily: 'var(--font-body)',
  }
  const labelStyle = {
    display: 'block', fontSize: '0.78rem', fontWeight: 700 as const, color: 'var(--ivd-red)',
    letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '0.6rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivd-gray)', paddingTop: 100, paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1.25rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--ivd-black)', marginBottom: '1.75rem' }}>
          Mi perfil
        </h1>

        {/* Avatar */}
        <div style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--ivd-gray)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: 'var(--ivd-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" width={76} height={76} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <UserIcon size={32} color="var(--ivd-gray-mid)" />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, color: 'var(--ivd-black)' }}>{profile.displayName}</span>
              <span style={{
                fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                background: 'var(--ivd-gray)', color: 'var(--ivd-gray-dark)', textTransform: 'uppercase', letterSpacing: '0.03em',
              }}>
                {ROLE_LABEL[profile.role] || profile.role}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--ivd-gray-mid)' }}>{profile.email}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'var(--ivd-black)',
                color: 'white', border: 'none', borderRadius: 7, fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer',
              }}>
                <Upload size={12} /> {uploading ? 'Subiendo...' : 'Cambiar foto'}
              </button>
              {profile.avatarUrl && (
                <button onClick={handleRemoveAvatar} disabled={uploading} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'none',
                  border: '1px solid var(--ivd-gray)', borderRadius: 7, fontSize: '0.76rem', cursor: 'pointer',
                }}>
                  <Trash2 size={12} /> Quitar
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </div>
          </div>
        </div>

        {profile.avatarRemovedAt && (
          <div style={{ marginBottom: '1.25rem', padding: '10px 14px', background: '#fff8e6', border: '1px solid #ffdd88', borderRadius: 8, fontSize: '0.82rem', color: '#8a6500' }}>
            Un administrador quitó tu foto de perfil anterior por no ser apropiada. Subí una nueva que cumpla las normas de la comunidad.
          </div>
        )}

        {/* Bio + Instagram */}
        <form onSubmit={handleSave} style={{ background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--ivd-gray)', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={labelStyle}>Descripción / gustos</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={280}
              placeholder="Contá algo sobre vos — tus intereses, qué temas te gustan..."
              style={{ ...inputStyle, resize: 'vertical' }} />
            <p style={{ fontSize: '0.72rem', color: 'var(--ivd-gray-mid)', marginTop: 4, textAlign: 'right' }}>{bio.length}/280</p>
          </div>

          <div>
            <label style={labelStyle}><AtSign size={13} style={{ display: 'inline', marginRight: 5 }} />Instagram</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ padding: '10px 0 10px 14px', border: '1px solid var(--ivd-gray)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'var(--ivd-gray-mid)', background: 'var(--ivd-gray)' }}>@</span>
              <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="tu.usuario"
                style={{ ...inputStyle, borderRadius: '0 8px 8px 0' }} />
            </div>
          </div>

          {error && <div style={{ padding: '10px 14px', background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: 8, color: '#cc0000', fontSize: '0.85rem' }}>⚠️ {error}</div>}
          {saved && <div style={{ padding: '10px 14px', background: '#f0fff4', border: '1px solid #b3e6c5', borderRadius: 8, color: '#1a7a3a', fontSize: '0.85rem' }}>✅ Guardado</div>}

          <button type="submit" disabled={saving} style={{
            alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', background: 'var(--ivd-red)', color: 'white', border: 'none',
            borderRadius: 8, fontWeight: 700, fontSize: '0.88rem', cursor: saving ? 'not-allowed' : 'pointer',
          }}>
            <Save size={15} /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        {/* Cerrar sesión */}
        <div style={{ marginTop: '1.25rem', background: 'white', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--ivd-gray)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ivd-black)', marginBottom: 10 }}>Sesión</h3>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'none',
            border: '1px solid #C8102E', color: '#C8102E', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
