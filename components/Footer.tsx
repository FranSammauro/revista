"use client"
import Link from 'next/link'

import { CATEGORIES } from '@/lib/types'
import { getCategoryIcon } from '@/components/icons'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ivd-black)', color: 'white', paddingTop: '4rem', paddingBottom: '2rem', marginTop: '6rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem', paddingBottom: '3rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <img src="/escudo-ivd.png" alt="Escudo IVD" width={32} height={32} style={{ objectFit: "contain", display: "block" }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                Revista<span style={{ color: 'var(--ivd-red)' }}>IVD</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 220 }}>
              La revista de Ciencias Naturales del Instituto Verbo Divino, Pilar.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ivd-red)', marginBottom: '1rem' }}>
              Disciplinas
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <li key={key}>
                  <Link href={`/articulos?cat=${key}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    color: 'rgba(255,255,255,0.55)', textDecoration: 'none',
                    fontSize: '0.875rem', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >
                    <span style={{ color: cat.color }}>
                      {getCategoryIcon(key, 15, cat.color)}
                    </span>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institution */}
          <div>
            <h4 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ivd-red)', marginBottom: '1rem' }}>
              Institución
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
              Instituto Verbo Divino<br />
              Pilar, Buenos Aires<br />
              Área de Ciencias Naturales
            </p>
            <a href="https://www.institutoverbodivino.edu.ar" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--ivd-red)', textDecoration: 'none' }}>
              → Sitio oficial del IVD
            </a>
          </div>
        </div>

        <div style={{ paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} RevistaIVD · Instituto Verbo Divino
          </span>
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-mono)' }}>
            Cs. Naturales · Secundaria
          </span>
        </div>
      </div>
    </footer>
  )
}
