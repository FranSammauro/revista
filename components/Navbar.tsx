'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import AuthButton from '@/components/AuthButton'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/articulos', label: 'Artículos' },
  { href: '/articulos?cat=matematica', label: 'Matemática' },
  { href: '/articulos?cat=quimica', label: 'Química' },
  { href: '/articulos?cat=fisica', label: 'Física' },
  { href: '/articulos?cat=ciencias-de-la-tierra', label: 'Cs. de la Tierra' },
  { href: '/articulos?cat=biologia', label: 'Biología' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  const isHome = pathname === '/'
  const lightMode = !isHome || scrolled

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    handler() // run immediately on mount/navigate
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [pathname])

  // Close menu on navigate
  useEffect(() => { setOpen(false) }, [pathname])

  const bgStyle = lightMode
    ? {
        background: 'rgba(250,250,250,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(200,16,46,0.12)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }
    : {
        background: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        borderBottom: 'none',
        boxShadow: 'none',
      }

  const linkColor = lightMode ? 'var(--ivd-gray-dark)' : 'rgba(255,255,255,0.85)'
  const logoTextColor = lightMode ? 'var(--ivd-black)' : 'white'

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, transition: 'background 0.3s, box-shadow 0.3s', ...bgStyle }}>
      <nav style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/escudo-ivd.png"
              alt="Escudo IVD"
              width={36}
              height={36}
              style={{ objectFit: 'contain', display: 'block', maxWidth: '100%' }}
            />
          </div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
            letterSpacing: '-0.02em', color: logoTextColor, transition: 'color 0.3s',
            whiteSpace: 'nowrap',
          }}>
            Revista<span style={{ color: 'var(--ivd-red)' }}>IVD</span>
          </span>
        </Link>

        {/* Desktop links — hidden on mobile via inline style */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                color: linkColor, textDecoration: 'none',
                fontSize: '0.82rem', fontWeight: 500,
                letterSpacing: '0.03em', transition: 'color 0.2s', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ivd-red)')}
                onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {!isMobile && <AuthButton lightMode={lightMode} />}

          {/* Mobile hamburger — only rendered on mobile */}
          {isMobile && (
            <button
              onClick={() => setOpen(prev => !prev)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: lightMode ? 'var(--ivd-black)' : 'white',
                padding: '8px', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
              aria-label="Abrir menú"
            >
              {open ? <X size={26} /> : <Menu size={26} />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {isMobile && open && (
        <div style={{
          background: 'rgba(250,250,250,0.99)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(200,16,46,0.12)',
          padding: '0.25rem 1.25rem 1.25rem',
        }}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '0.85rem 0',
                color: 'var(--ivd-gray-dark)', textDecoration: 'none',
                fontWeight: 500, fontSize: '1rem',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              {l.label}
            </Link>
          ))}
          <div style={{ paddingTop: '1rem' }}>
            <AuthButton lightMode={true} />
          </div>
        </div>
      )}
    </header>
  )
}
