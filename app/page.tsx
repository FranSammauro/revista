import Link from 'next/link'
import ArticleCard from '@/components/ArticleCard'
import { getAllArticles, getFeaturedArticles, CATEGORIES } from '@/lib/articles'
import { getCategoryIcon } from '@/components/icons'
import { ArrowRight, ChevronRight } from 'lucide-react'

export default async function Home() {
  const [featured, all] = await Promise.all([getFeaturedArticles(), getAllArticles()])
  const recent = all.slice(0, 4)

  return (
    <div>
      <style>{`
        .btn-red:hover { background: var(--ivd-red-dark) !important; }
        .btn-outline:hover { border-color: var(--ivd-red) !important; color: white !important; }
        .cat-card:hover { transform: translateY(-5px) !important; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', background: 'var(--ivd-black)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(200,16,46,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(200,16,46,0.07) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,16,46,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', paddingTop: 120, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', opacity: 0, animation: 'fadeUp 0.7s ease 0.1s forwards' }}>
            <div style={{ width: 32, height: 1, background: 'var(--ivd-red)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ivd-red)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Instituto Verbo Divino · Pilar
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1, color: 'white', marginBottom: '0.25rem', opacity: 0, animation: 'fadeUp 0.7s ease 0.2s forwards' }}>
            Revista
          </h1>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1, color: 'var(--ivd-red)', marginBottom: '2rem', opacity: 0, animation: 'fadeUp 0.7s ease 0.3s forwards' }}>
            IVD
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.6)', maxWidth: 560, lineHeight: 1.7, marginBottom: '3rem', opacity: 0, animation: 'fadeUp 0.7s ease 0.4s forwards' }}>
            Ciencias Naturales para la secundaria: Química, Física, Ciencias de la Tierra y Biología — explicadas con rigor y curiosidad.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', opacity: 0, animation: 'fadeUp 0.7s ease 0.5s forwards' }}>
            <Link href="/articulos" className="btn-red" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '14px 28px', background: 'var(--ivd-red)', color: 'white', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', transition: 'background 0.2s' }}>
              Explorar artículos <ArrowRight size={16} />
            </Link>
            <Link href="/articulos?cat=quimica" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '14px 28px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderRadius: 8, fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s' }}>
              Ver Química
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '3rem', marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', opacity: 0, animation: 'fadeUp 0.7s ease 0.6s forwards' }}>
            {[
              { n: String(all.length), label: 'Artículos' },
              { n: String(Object.keys(CATEGORIES).length), label: 'Disciplinas' },
              { n: '2025', label: 'Edición' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'white' }}>{s.n}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0, animation: 'fadeIn 1s ease 1.2s forwards' }}>
          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Desplazá</span>
          <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom, rgba(200,16,46,0.7), transparent)' }} />
        </div>
      </section>

      {/* ── MARQUEE TICKER ───────────────────────────────────────── */}
      <div style={{ background: 'var(--ivd-red)', padding: '11px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', animation: 'marquee 30s linear infinite', whiteSpace: 'nowrap' }}>
          {Array(6).fill(['QUÍMICA', 'FÍSICA', 'CS. DE LA TIERRA', 'BIOLOGÍA']).flat().map((item, i) => (
            <span key={i} style={{ marginRight: '3rem', fontSize: '0.75rem', fontWeight: 700, color: 'white', letterSpacing: '0.12em' }}>
              · {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURED ARTICLES ────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div className="red-line" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ivd-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Destacados</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--ivd-black)' }}>
              Artículos destacados
            </h2>
          </div>
          <Link href="/articulos" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ivd-red)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            Ver todos <ChevronRight size={16} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {featured.map(article => (
            <ArticleCard key={article.slug} article={article} variant="featured" />
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────── */}
      <section style={{ background: 'var(--ivd-black)', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div className="red-line" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ivd-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Disciplinas</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'white' }}>
              Explorá por área
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <Link key={key} href={`/articulos?cat=${key}`} style={{ textDecoration: 'none' }}>
                <div className="cat-card" style={{
                  padding: '1.75rem', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                  transition: 'all 0.3s ease', cursor: 'pointer',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: cat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: cat.color }}>
                    {getCategoryIcon(key, 24, cat.color)}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: '1.05rem', marginBottom: '0.35rem' }}>{cat.label}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: cat.color, fontSize: '0.78rem', fontWeight: 600 }}>
                    Explorar <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT ARTICLES ──────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div className="red-line" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ivd-red)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Últimos artículos</span>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--ivd-black)' }}>
              Lo más reciente
            </h2>
          </div>
          <Link href="/articulos" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ivd-red)', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            Ver todos <ChevronRight size={16} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {recent.map(article => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
    </div>
  )
}
