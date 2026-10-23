'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PenLine, LogIn } from 'lucide-react'

export default function AuthButton({ lightMode }: { lightMode: boolean }) {
  const [user, setUser] = useState<{ displayName: string } | null | undefined>(undefined)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        setUser(d.primary?.kind === 'user' ? { displayName: d.primary.displayName } : null)
      })
      .catch(() => {
        // Si falla la llamada (red, servidor caído, lo que sea), no nos
        // quedamos trabados mostrando el placeholder vacío para siempre —
        // asumimos "no logueado" y mostramos el botón de Ingresar igual.
        setUser(null)
      })
  }, [])

  // Don't render until we know auth state (avoids flash)
  if (user === undefined) return <div style={{ width: 90 }} />

  if (user) {
    return (
      <Link href="/publicar" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 16px', background: 'var(--ivd-red)',
        color: 'white', textDecoration: 'none',
        borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
        transition: 'background 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--ivd-red-dark)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--ivd-red)')}
      >
        <PenLine size={14} /> Publicar
      </Link>
    )
  }

  return (
    <Link href="/login" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 16px',
      border: `1px solid ${lightMode ? 'rgba(200,16,46,0.35)' : 'rgba(200,16,46,0.5)'}`,
      color: lightMode ? 'var(--ivd-red)' : 'rgba(255,255,255,0.8)',
      textDecoration: 'none', borderRadius: 8,
      fontSize: '0.8rem', fontWeight: 600,
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--ivd-red)'
        e.currentTarget.style.color = 'white'
        e.currentTarget.style.borderColor = 'var(--ivd-red)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.color = lightMode ? 'var(--ivd-red)' : 'rgba(255,255,255,0.8)'
        e.currentTarget.style.borderColor = lightMode ? 'rgba(200,16,46,0.35)' : 'rgba(200,16,46,0.5)'
      }}
    >
      <LogIn size={14} /> Ingresar
    </Link>
  )
}
