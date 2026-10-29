'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { PenLine, LogIn, User as UserIcon, FileText, LogOut, Settings, LayoutDashboard, GraduationCap } from 'lucide-react'

type Session =
  | { kind: 'out' }
  | { kind: 'user'; displayName: string; avatarUrl: string | null; role: string }
  | { kind: 'teacher'; displayName: string; avatarUrl: string | null; activeSubjectSlug: string | null; activeSubjectLabel: string | null }

export default function AuthButton({ lightMode }: { lightMode: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<Session | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const checkSession = useCallback(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.primary?.kind === 'user') {
          setSession({ kind: 'user', displayName: d.primary.displayName, avatarUrl: d.avatarUrl, role: d.primary.role })
        } else if (d.primary?.kind === 'teacher') {
          setSession({
            kind: 'teacher',
            displayName: d.primary.displayName,
            avatarUrl: d.avatarUrl,
            activeSubjectSlug: d.subject?.subjectSlug ?? null,
            activeSubjectLabel: d.subject?.subjectLabel ?? null,
          })
        } else {
          setSession({ kind: 'out' })
        }
      })
      .catch(() => {
        // Si falla la llamada (red, servidor caído, lo que sea), no nos
        // quedamos trabados mostrando el placeholder vacío para siempre —
        // asumimos "no logueado" y mostramos el botón de Ingresar igual.
        setSession({ kind: 'out' })
      })
  }, [])

  // AuthButton vive dentro del layout raíz y nunca se desmonta al navegar
  // (router.push es una navegación SPA, no un reload). Por eso NO alcanza
  // con pedir la sesión una sola vez al montar: hay que volver a chequear
  // cada vez que cambia la ruta (cubre login/logout, que siempre navegan a
  // otra página) y, para el caso en que el logout no cambia de URL, se
  // limpia el estado al toque en handleLogout de abajo.
  useEffect(() => {
    checkSession()
  }, [pathname, checkSession])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleLogout() {
    setOpen(false)
    await Promise.all([
      fetch('/api/auth/logout', { method: 'POST' }),
      fetch('/api/teacher/subject-logout', { method: 'POST' }),
    ])
    setSession({ kind: 'out' }) // feedback instantáneo, sin depender de que cambie la ruta
    router.push('/')
    router.refresh()
  }

  // Don't render until we know auth state (avoids flash)
  if (session === undefined) return <div style={{ width: 90 }} />

  if (session.kind === 'out') {
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

  // --- Logueado: profesor o alumno/admin ---
  const isTeacher = session.kind === 'teacher'
  const primaryAction = isTeacher
    ? (session.activeSubjectSlug
        ? { href: '/panel-materia', label: `Panel de ${session.activeSubjectLabel}`, icon: <LayoutDashboard size={14} /> }
        : { href: '/panel-materia/entrar', label: 'Entrar a mi materia', icon: <GraduationCap size={14} /> })
    : session.role === 'ADMIN'
      ? { href: '/admin', label: 'Panel admin', icon: <LayoutDashboard size={14} /> }
      : { href: '/publicar', label: 'Publicar', icon: <PenLine size={14} /> }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }} ref={menuRef}>
      <Link href={primaryAction.href} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 16px', background: 'var(--ivd-red)',
        color: 'white', textDecoration: 'none',
        borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
        transition: 'background 0.2s', whiteSpace: 'nowrap',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--ivd-red-dark)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--ivd-red)')}
      >
        {primaryAction.icon} {primaryAction.label}
      </Link>

      <button onClick={() => setOpen(!open)} aria-label="Cuenta" style={{
        width: 34, height: 34, borderRadius: '50%', border: `2px solid ${open ? 'var(--ivd-red)' : 'transparent'}`,
        padding: 0, cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
        background: lightMode ? 'var(--ivd-gray)' : 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {session.avatarUrl ? (
          <img src={session.avatarUrl} alt="" width={34} height={34} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <UserIcon size={16} color={lightMode ? 'var(--ivd-gray-dark)' : 'white'} />
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0, minWidth: 200,
          background: 'white', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          border: '1px solid var(--ivd-gray)', overflow: 'hidden', zIndex: 200,
        }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--ivd-gray)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--ivd-black)' }}>{session.displayName}</div>
            {isTeacher && <div style={{ fontSize: '0.72rem', color: 'var(--ivd-gray-mid)' }}>Docente</div>}
          </div>
          <MenuLink href="/mi-perfil" icon={<Settings size={15} />} onClick={() => setOpen(false)}>Mi perfil</MenuLink>
          {!isTeacher && (
            <MenuLink href="/mis-articulos" icon={<FileText size={15} />} onClick={() => setOpen(false)}>Mis artículos</MenuLink>
          )}
          {isTeacher && session.activeSubjectSlug && (
            <MenuLink href="/panel-materia/entrar" icon={<GraduationCap size={15} />} onClick={() => setOpen(false)}>Cambiar de materia</MenuLink>
          )}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left',
            padding: '0.65rem 1rem', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.85rem', color: '#C8102E', fontFamily: 'var(--font-body)', fontWeight: 600,
          }}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

function MenuLink({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1rem',
      color: 'var(--ivd-gray-dark)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--ivd-gray)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {icon} {children}
    </Link>
  )
}
