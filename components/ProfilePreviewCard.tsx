'use client'
import { useEffect, useState } from 'react'
import { User as UserIcon, AtSign, X } from 'lucide-react'

interface PublicProfile {
  id: string
  displayName: string
  avatarUrl: string | null
  bio: string | null
  instagramHandle: string | null
  role: string
  isOnline: boolean
  memberSince: string
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  ALUMNO: 'Alumno/a',
}

/**
 * Tarjeta de vista previa de perfil, estilo Discord: se abre al hacer click
 * en el nombre/avatar de quien comentó. userId null/undefined = no mostrar.
 */
export default function ProfilePreviewCard({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setProfile(null)
    fetch(`/api/users/${userId}/public-profile`)
      .then(r => r.json())
      .then(d => setProfile(d.profile || null))
      .finally(() => setLoading(false))
  }, [userId])

  if (!userId) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 340, background: 'white', borderRadius: 16,
          overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Banner */}
        <div style={{ height: 70, background: 'linear-gradient(135deg, var(--ivd-red), var(--ivd-black))', position: 'relative' }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.3)', border: 'none',
            borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white',
          }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '0 1.25rem 1.25rem' }}>
          {/* Avatar overlapping the banner */}
          <div style={{ marginTop: -40, marginBottom: 10 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', border: '4px solid white',
              background: 'var(--ivd-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative',
            }}>
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" width={80} height={80} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserIcon size={34} color="var(--ivd-gray-mid)" />
              )}
              {profile && (
                <span title={profile.isOnline ? 'En línea' : 'Desconectado'} style={{
                  position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: '50%',
                  background: profile.isOnline ? '#1a7a3a' : '#9A9A9A', border: '3px solid white',
                }} />
              )}
            </div>
          </div>

          {loading && <p style={{ color: 'var(--ivd-gray-mid)', fontSize: '0.85rem' }}>Cargando...</p>}

          {!loading && !profile && (
            <p style={{ color: 'var(--ivd-gray-mid)', fontSize: '0.85rem' }}>No se pudo cargar este perfil.</p>
          )}

          {profile && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--ivd-black)' }}>
                  {profile.displayName}
                </h3>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                  background: 'var(--ivd-gray)', color: 'var(--ivd-gray-dark)', textTransform: 'uppercase',
                }}>
                  {ROLE_LABEL[profile.role] || profile.role}
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: profile.isOnline ? '#1a7a3a' : 'var(--ivd-gray-mid)', fontWeight: 600, marginTop: 4 }}>
                {profile.isOnline ? '● En línea' : '○ Desconectado/a'}
              </p>

              {profile.bio && (
                <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--ivd-gray)', borderRadius: 10 }}>
                  <p style={{ fontSize: '0.84rem', color: 'var(--ivd-gray-dark)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{profile.bio}</p>
                </div>
              )}

              {profile.instagramHandle && (
                <a
                  href={`https://instagram.com/${profile.instagramHandle}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: '0.82rem', color: 'var(--ivd-red)', fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  <AtSign size={14} /> {profile.instagramHandle}
                </a>
              )}

              <p style={{ marginTop: 14, fontSize: '0.72rem', color: 'var(--ivd-gray-mid)' }}>
                Miembro desde {new Date(profile.memberSince).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
