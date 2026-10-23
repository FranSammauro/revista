'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

const LINKS = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/whitelist', label: 'Profesores' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/admin/logs', label: 'Logs' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {LINKS.map(l => (
        <Link key={l.href} href={l.href} style={{
          padding: '7px 13px', borderRadius: 8, textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600,
          background: pathname === l.href ? 'var(--ivd-red)' : 'transparent',
          color: pathname === l.href ? 'white' : 'rgba(255,255,255,0.65)',
          border: pathname === l.href ? 'none' : '1px solid rgba(255,255,255,0.15)',
        }}>
          {l.label}
        </Link>
      ))}
      <button onClick={handleLogout} style={{
        display: 'flex', alignItems: 'center', gap: 5, background: 'none',
        border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
        borderRadius: 8, padding: '7px 13px', cursor: 'pointer', fontSize: '0.82rem',
      }}>
        <LogOut size={14} /> Salir
      </button>
    </div>
  )
}
